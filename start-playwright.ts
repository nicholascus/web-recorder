/**
 * Design
 * - runner
 *   - loads all parsers
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
import { URL } from 'url';

async function findAsyncSequential<T>(
    array: T[],
    predicate: (t: T) => Promise<boolean>,
  ): Promise<T | undefined> {
    for (const t of array) {
      if (await predicate(t)) {
        return t;
      }
    }
    return undefined;
  }

async function attachParsers(page: Page) {
    try {
        await page.bringToFront();
        const title: string = await page.title();
        const pageurl: string = page.url();
        console.log(`Page found. title: ${title} url:${pageurl}`);
        const url = new URL(pageurl);
        if (url.host === "twitter.com") {
            await outputNewTweets(page);                
            page.on('request', async (...args) => {
                await outputNewTweets(page);
            });
            a.push(page.waitForEvent('close', {
                timeout: 0,
                predicate: (p: Page) => {
                    console.log(`!!PAGE CLOSED!! ${title}`);
                    return true;
                }
            }));
        } else if (url.host === "linkedin.com" && url.pathname.startsWith("/jobs/collections")) {

        }
    } catch (e) {
        console.log(`failed to get page title due to ${e}`)
    }

}

class Tweet {
    uid: string;
    name: string;
    username: string;
    time: string;
    content: string;
    isAd: boolean;
    hasQuote: boolean;
    quote?: Tweet;
    interactions: { reply: string, retweet: string, like: string};
    parent?: Tweet;
}

class TweetElement {
    private element: Locator;
    private tweet: Tweet = null;
    constructor(element: Locator) {
        this.element = element;
    }
    public async parse(page: Page): Promise<Tweet> {
        if (!this.tweet) {
            this.tweet = new Tweet();
            // current url is thread id
            // TODO: tell the difference between thread replies and suggestions!
            const url = new URL(page.url());
            const parentIdMatch = url.pathname.match(/\/(.*)\/status\/(\d*)(\/analytics|)/);
            if (parentIdMatch) {
                this.tweet.parent = new Tweet();
                this.tweet.parent.username = parentIdMatch[1];
                this.tweet.parent.uid = parentIdMatch[2];
            }

            // tweet id
            const tweetIdElement = this.element.locator('xpath=/descendant::a[contains(@href,"status")]').first();
            const tweetHrefId = await tweetIdElement.getAttribute('href');
            const tweetIdMatch = tweetHrefId.match(/\/(.*)\/status\/(\d*)(\/analytics|)/);
            if (tweetIdMatch) {
                this.tweet = new Tweet();
                this.tweet.username = tweetIdMatch[1];
                this.tweet.uid = tweetIdMatch[2];
            }

            // tweet or ad ?
            this.tweet.isAd = !!await this.element.locator('xpath=/descendant::span[.="Ad"]').count();

            if (!this.tweet.isAd) {
                this.tweet.time = await this.element.locator('xpath=/descendant::time').first().getAttribute('datetime');
            }

            this.tweet.hasQuote = !!await this.element.locator('xpath=/descendant::span[.="Quote"]').count();
            if (this.tweet.hasQuote) {
                this.tweet.quote = await new TweetElement(this.element.locator('xpath=/descendant::div[div/span[.="Quote"]]/div[descendant::*[@data-testid="tweetText"]]').first()).parse(page);
            }

            this.tweet.content = await this.element.getByTestId('tweetText').first().innerText();

            let reply='0', retweet='0', like='0';
            if ((await this.element.getByTestId('reply').all()).length) {
                reply  = await this.element.getByTestId('reply').first().innerText();
            }
            if ((await this.element.getByTestId('like').all()).length) {
                like = await this.element.getByTestId('like').first().innerText();
            }
            if ((await this.element.getByTestId('retweet').all()).length) {
                retweet = await this.element.getByTestId('retweet').first().innerText();
            }
            this.tweet.interactions = {reply, retweet, like};
        }
        return this.tweet;
    }
    public async isVisible() {
        return this.element.isVisible();
    }
}

const knownTweets: string[] = [];

const a = [];

async function outputNewTweets(page: Page) {
    const tweets: Locator[] = await page.getByTestId('primaryColumn').getByTestId('tweet').all();

    for(let i=0; i<tweets.length; i++) {
        const tweet = new TweetElement(tweets[i]);
        try {
            const t = await tweet.parse(page);
            // console.log(`\n!FOUND_A_TWEET! ${page.url()} ${t.uid}`);
            if (!knownTweets.includes(t.uid)) {
                console.log(`\n!FOUND_NEW_TWEET! uid=${t.uid}, isAd=${t.isAd ? "Y" : "N"}, time=${t.time}, user=${t.username}${t.hasQuote ? `\n!!QUOTE!!: uid=${t.quote.uid} user=${t.quote.username} TEXT:${t.quote.content}`:''}\n!!TEXT!!:${t.content}\n${JSON.stringify(t.interactions)}`);
                knownTweets.push(t.uid);
            }
        } catch (e) {

        }
    }
}  

(async () => {
    try {
        const browser: Browser = await chromium.connectOverCDP('http://localhost:9222');
        // browser.on('disconnected', () => process.exit());

        console.log(browser.isConnected() && 'Connected to Chrome.');
        console.log(`Contexts in CDP session: ${browser.contexts().length}.`);

        const contexts: BrowserContext[] = browser.contexts();

        for(let j=0; j<contexts.length; j++) {
            const context: BrowserContext = contexts[j];
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

        // const page: Page = await findAsyncSequential(pages, async function (p: any) { return (await p.title())==="Home / X";});

        // page.on('request', async (...args) => {
        //     await outputNewTweets(page);
        // });

        // const title: string = await page.title();
        // console.log(`Found page with title "Home / X" ${title}`);

        // await outputNewTweets(page);

        // await page.waitForEvent('close', { timeout: 40000 });

        await browser.close();
    } catch (error) {
        console.log(`Cannot connect to Chrome.\n${error}`);
    }
})();


// profile  ~/Library/Application Support/Google/Chrome
// binary  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
// $x('//*[@data-testid="User-Name" and @id]')[0].id

// Tweet id:
// $x('//*[@data-testid="tweet"]//a[contains(@href,"/status/")]/@href')
