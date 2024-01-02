/**
 * Design
 * - cli
 * - runner
 *   - loads all parsers
 *   - error logging and parsers debugging 
 *   - connect to browser / start browser
 *   - setup all browser tabs with the right parsers => all pages should have page.on('domcontentloaded', ...) attaching parser in them
 *   - see if the active window is new ? (intiate / reinitiate parser if requried) => context.on('page', ...)
 * - browser manager
 *   - 
 * - site parser interface
 * - writers for local percistense
 * - server sync
 *   - authentication
 *   - data download
 *  
 * - parser implementations
 *   - linkedin job
 *   - twitter
 * 
 * DevExp
 * - how to unit test
 * - how to integration test
 * - how to component test parsers
 * - how to format
 * 
 * 
 */

import { Browser, BrowserContext, Locator, Page, chromium } from 'playwright';  // Or 'firefox' or 'webkit'.
import URI from 'urijs';
import { TwitterFeedParser, TweetConsoleLogger } from './parsers/TwitterFeedParser';
import { LinkedInJobCollectionsParser, LinkedInJobConsoleLogger } from './parsers/LinkedInJobCollectionsParser';
import IWebParser from './base/IWebParser';
import ComponentLoader from './engine/ComponentLoader';

const componentLoader = new ComponentLoader();

async function attachParsers(page: Page) {
    try {
        await page.bringToFront();
        const title: string = await page.title();
        const pageurl: string = page.url();
        console.log(`Page found. title: ${title} url:${pageurl}`);
        const uri = new URI(pageurl);

        const parsers: IWebParser[] = await componentLoader.getParsers();
        
        for(var i=0; i < parsers.length; i++) {
            const parser = parsers[i];
            if (parser.isParsableUrl(uri)) {
                await parser.parsePage(page);                
                page.on('request', async (...args) => {
                    await parser.parsePage(page);                
                });
                a.push(page.waitForEvent('close', {
                    timeout: 0,
                    predicate: (p: Page) => {
                        console.log(`!!PAGE CLOSED!! ${title}`);
                        return true;
                    }
                }));
            }
        }
    } catch (e) {
        console.log(`failed to get page title due to ${e}`)
    }
}


const a = [];

(async () => {
    try {
        const browser: Browser = await chromium.connectOverCDP('http://localhost:9222');
        // browser.on('disconnected', () => process.exit());

        console.log(browser.isConnected() && 'Connected to Chrome.');
        console.log(`Contexts in CDP session: ${browser.contexts().length}.`);

        const contexts: BrowserContext[] = browser.contexts();

        for(let j=0; j<contexts.length; j++) {
            const context: BrowserContext = contexts[j];
            context.setDefaultTimeout(1000);
            const pages: Page[] = context.pages();
            console.log(`!!CONTEXT!! N${j}`);
            context.on('page', (page) => {
                console.log('!!NEW PAGE!! need to register to tab list');
                page.on('domcontentloaded', async (page) => {
                    console.log(await page.title());
                    await attachParsers(page);
                });
            });

            for(let i=0; i<pages.length; i++) {
                const page: Page = pages[i];
                await attachParsers(page);
            }
        }

        await Promise.all(a);

        await browser.close();
    } catch (error) {
        console.log(`Cannot connect to Chrome.\n${error}`);
    }
})();


// profile  ~/Library/Application Support/Google/Chrome
// binary  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
