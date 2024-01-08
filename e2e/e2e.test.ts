import { chromium, ChromiumBrowser, Page } from 'playwright';
import { Server } from 'http';
import { AddressInfo } from 'net';
import http from 'http';
import express from 'express';
import path from 'path';
import { Bootstrap } from '../src/engine/Bootstrap';
import { config, loadJsonConfig } from '../src/engine/JsonConfig';
import { MongoClient } from 'mongodb';
import { waitUntil } from 'async-wait-until';
import { logger } from '../src/engine/logger';

let browserCdpPort: number;
let server: Server;

function startServer(
    folder: string,
    port = 0,
    interval = 100,
    attempts = 20,
): Promise<number> {
    let address: AddressInfo;
    const app = express();

    app.use(express.static(path.resolve(__dirname, 'test-page')));

    server = app.listen(port, '0.0.0.0', () => {
        address = server.address() as AddressInfo;
        logger.info(`Server listening on port: ${address.port}`);
    });

    return waitUntil(
        () => address !== undefined && address.port,
        interval * attempts,
        interval,
    );
}

let client: MongoClient;
async function getMongoClient() {
    const connectionString: string = `mongodb://${
        process.env.MONGO_SERVER_ADDRESS ?? '127.0.0.1:27017/test-bopilot'
    }`;
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

jest.setTimeout(10000);

describe('End-to-End Test', () => {
    let browser: ChromiumBrowser;
    let page: Page;
    let port: number;
    let client: MongoClient;
    const testCollection: string = process.env.MONGO_COLLECTION ?? 'data';

    beforeAll(async () => {
        port = await startServer('./test-page');

        browserCdpPort = getFreePort();
        browser = await chromium.launch({
            args: [`--remote-debugging-port=${browserCdpPort}`],
            headless: true,
        });

        loadJsonConfig(
            path.resolve(
                __dirname,
                `${process.env.CONFIG_FILE ?? 'test-config.json'}`,
            ),
        );
        config.setComponentConfig(
            'TestParser',
            'url',
            `http://127.0.0.1:${port}`,
        );
        logger.debug(config, 'config');
        new Bootstrap().run(browserCdpPort);
    });

    afterAll(async () => {
        server.close();
        await browser.close();
    });

    beforeEach(async () => {
        client = await getMongoClient();
        client.db().collection(testCollection).deleteMany({});

        page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${port}/index.html`);
    });

    afterEach(async () => {
        await page.close();
    });

    afterAll(async () => {
        server.close();
    });

    it('should be able to see test page in the browser (while Web Recorder connected to browser too)', async () => {
        const title = await page.title();
        expect(title).toBe('Content Parsing Test');
    });

    it('should see 5 elements from the page captured to mongodb before scrolling', async () => {
        expect(
            await waitUntil(
                async function () {
                    const documentsCount = await client
                        .db()
                        .collection(testCollection)
                        .countDocuments({});
                    logger.debug(`documentsCount = ${documentsCount}`);
                    return documentsCount === 5;
                },
                10000,
                50,
            ),
        ).toBe(true);
    });

    it('should see more elements captured from the page to mongodb as the page is scrolled through in the browser', async () => {
        expect(
            await waitUntil(
                async function () {
                    await page.evaluate(
                        'window.scrollTo(0, document.body.scrollHeight)',
                    );
                    const documentsCount = await client
                        .db()
                        .collection(testCollection)
                        .countDocuments({});
                    logger.debug(`documentsCount = ${documentsCount}`);
                    return documentsCount > 15;
                },
                10000,
                50,
            ),
        ).toBe(true);
    });
});
