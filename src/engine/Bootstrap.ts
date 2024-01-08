import { Browser, BrowserContext, Page, chromium } from 'playwright-core';
import ComponentLoader from './ComponentLoader';
import URI from 'urijs';
import IWebParser from '../base/IWebParser';
import { logger } from './logger';

export class Bootstrap {
    componentLoader: ComponentLoader = ComponentLoader.getInstance();
    a: Promise<Page>[] = [];

    async attachParsers(page: Page) {
        try {
            await page.bringToFront();
            const title: string = await page.title();
            const pageurl: string = page.url();
            logger.debug(`Page found. title: ${title} url:${pageurl}`);
            const uri = new URI(pageurl);

            const parsers: IWebParser<any>[] =
                await this.componentLoader.getParsers();

            for (var i = 0; i < parsers.length; i++) {
                const parser = parsers[i];
                if (parser.isParsableUrl(uri)) {
                    await parser.parsePage(page);
                    page.on('request', async (...args) => {
                        await parser.parsePage(page);
                    });
                    this.a.push(
                        page.waitForEvent('close', {
                            timeout: 0,
                            predicate: (p: Page) => {
                                logger.debug(`!!PAGE CLOSED!! ${title}`);
                                return true;
                            },
                        }),
                    );
                }
            }
        } catch (e) {
            logger.debug(`failed to get page title due to ${e}`);
        }
    }

    async attachBrowser(browser: Browser) {
        const contexts: BrowserContext[] = browser.contexts();

        for (let j = 0; j < contexts.length; j++) {
            const context: BrowserContext = contexts[j];
            context.setDefaultTimeout(1000);
            const pages: Page[] = context.pages();
            logger.debug(`!!CONTEXT!! N${j}`);
            context.on('page', page => {
                logger.debug('!!NEW PAGE!! need to register to tab list');
                page.on('domcontentloaded', async page => {
                    logger.debug(await page.title());
                    await this.attachParsers(page);
                });
            });

            for (let i = 0; i < pages.length; i++) {
                const page: Page = pages[i];
                await this.attachParsers(page);
            }
        }
    }

    async run(port: number = 9222) {
        try {
            const browser: Browser = await chromium.connectOverCDP(
                `http://localhost:${port}`,
            );
            // browser.on('disconnected', () => process.exit());

            logger.debug(browser.isConnected() && 'Connected to Chrome.');
            logger.debug(
                `Contexts in CDP session: ${browser.contexts().length}.`,
            );

            return this.attachBrowser(browser);

            // await Promise.all(this.a);

            // await browser.close();
        } catch (error) {
            logger.error(`Cannot connect to Chrome.\n${error}`);
        }
    }
}
