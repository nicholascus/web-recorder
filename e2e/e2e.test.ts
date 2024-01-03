import { chromium, ChromiumBrowser, Page } from 'playwright';
import { Server } from 'http';
import { AddressInfo } from 'net';
import http from 'http';
import express from 'express';
import path from 'path';
import { Bootstrap } from '../src/engine/Bootstrap';
import { loadJsonConfig } from '../src/engine/JsonConfig';
import { MongoClient } from 'mongodb';
import { waitUntil } from 'async-wait-until';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let browserCdpPort: number;

function startServer(
    folder: string,
    port = 0,
    interval = 100,
    attempts = 20,
): Promise<Server> {
    let address: AddressInfo;
    const app = express();

    app.use(express.static(path.resolve(__dirname, 'test-page')));

    let listener = app.listen(port, '0.0.0.0', () => {
        address = listener.address() as AddressInfo;
        console.log(`Server listening on port: ${address.port}`);
    });

    listener.close();

    return new Promise(async (resolve, reject) => {
        let count = 0;
        while (++count < attempts) {
            await sleep(interval);
            try {
                if (address) {
                    const response = await fetch(
                        `http://127.0.0.1:${address.port}/index.html`,
                    );
                    if (response.ok && response.status === 200) {
                        resolve(listener);
                        break;
                    }
                }
            } catch (e) {
                console.log(`Still down, trying ${count} of ${attempts}`);
            }
        }
        reject(new Error(`Server is down: ${count} attempts tried`));
    });
}

let client: MongoClient;
async function getMongoClient() {
    const connectionString: string = 'mongodb://127.0.0.1:27017/test-bopilot';
    if (!client) {
        client = await MongoClient.connect(connectionString);
    }
    return client;
}

function getFreePort(): number {
    const server = http.createServer();
    server.listen(0);
    const port = (server.address() as AddressInfo).port;
    server.close();
    return port;
}

jest.setTimeout(30000);

describe('End-to-End Test', () => {
    let browser: ChromiumBrowser;
    let page: Page;
    let server: Server;
    let port: number;
    let parsingServer;
    let client: MongoClient;

    beforeAll(async () => {
        server = await startServer('./test-page', 8080);
        port = (server.address() as AddressInfo).port;

        browserCdpPort = getFreePort();
        browser = await chromium.launch({
            args: [`--remote-debugging-port=${browserCdpPort}`],
            headless: true,
        });
        loadJsonConfig(path.resolve(__dirname, 'test-config.json'));
        parsingServer = new Bootstrap().run(browserCdpPort);
    });

    afterAll(async () => {
        server.close();
        await browser.close();
    });

    beforeEach(async () => {
        client = await getMongoClient();
        client.db().collection('data').deleteMany({});

        page = await browser.newPage();
        await page.goto(`http://localhost:${port}/index.html`);
    });

    afterEach(async () => {
        await page.close();
    });

    it('should have 5 elements on the page before scrolling', async () => {
        const title = await page.title();
        expect(title).toBe('Content Parsing Test'); // <-- we are on the right page

        expect(
            await waitUntil(
                async function () {
                    const documentsCount = await client
                        .db()
                        .collection('data')
                        .countDocuments({});
                    // console.log(`documentsCount = ${documentsCount}`);
                    return documentsCount === 5;
                },
                10000,
                50,
            ),
        ).toBe(true);
    });

    it('should load more content on scroll', async () => {
        expect(
            await waitUntil(
                async function () {
                    await page.evaluate(
                        'window.scrollTo(0, document.body.scrollHeight)',
                    );
                    const documentsCount = await client
                        .db()
                        .collection('data')
                        .countDocuments({});
                    // console.log(`documentsCount = ${documentsCount}`);
                    return documentsCount > 15;
                },
                10000,
                50,
            ),
        ).toBe(true);
    });
});
