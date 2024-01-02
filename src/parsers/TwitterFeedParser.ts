import { Browser, BrowserContext, Locator, Page, chromium } from 'playwright';  // Or 'firefox' or 'webkit'.
import { URL } from 'url';
import URI from 'urijs';
import BaseEntity from '../base/BaseEntity';
import AbstractWebParser from '../base/AbastractWebParser';
import IContentWriter from '../base/IContentWriter';

export default class TwitterFeedParser extends AbstractWebParser<Tweet> {
    async extractUid(page: Page, element: Locator): Promise<string> {
        // tweet id
        const tweetIdElement = element.locator('xpath=/descendant::a[contains(@href,"status")]').first();
        const tweetHrefId = await tweetIdElement.getAttribute('href');
        const tweetIdMatch = tweetHrefId.match(/\/.*\/status\/(\d*)(\/analytics|)/);
        return tweetIdMatch[1];
    }
    async extractFullRecord(page: Page, element: Locator): Promise<Tweet> {
        const tweet = new Tweet();
        // current url is thread id
        // TODO: tell the difference between thread replies and suggestions!
        const url = new URL(page.url());
        const parentIdMatch = url.pathname.match(/\/(.*)\/status\/(\d*)(\/analytics|)/);
        if (parentIdMatch) {
            tweet.parent = new Tweet();
            tweet.parent.username = parentIdMatch[1];
            tweet.parent.uid = parentIdMatch[2];
        }

        // tweet id
        const tweetIdElement = element.locator('xpath=/descendant::a[contains(@href,"status")]').first();
        const tweetHrefId = await tweetIdElement.getAttribute('href');
        const tweetIdMatch = tweetHrefId.match(/\/(.*)\/status\/(\d*)(\/analytics|)/);
        if (tweetIdMatch) {
            tweet.username = tweetIdMatch[1];
            tweet.uid = tweetIdMatch[2];
        }

        // tweet or ad ?
        tweet.isAd = !!await element.locator('xpath=/descendant::span[.="Ad"]').count();

        if (!tweet.isAd) {
            tweet.time = await element.locator('xpath=/descendant::time').first().getAttribute('datetime');
        }

        tweet.hasQuote = !!await element.locator('xpath=/descendant::span[.="Quote"]').count();
        if (tweet.hasQuote) {
            tweet.quote = await this.extractFullRecord(page, element.locator('xpath=/descendant::div[div/span[.="Quote"]]/div[descendant::*[@data-testid="tweetText"]]').first());
        }

        tweet.content = await element.getByTestId('tweetText').first().innerText();

        let reply='0', retweet='0', like='0';
        if ((await element.getByTestId('reply').all()).length) {
            reply  = await element.getByTestId('reply').first().innerText();
        }
        if ((await element.getByTestId('like').all()).length) {
            like = await element.getByTestId('like').first().innerText();
        }
        if ((await element.getByTestId('retweet').all()).length) {
            retweet = await element.getByTestId('retweet').first().innerText();
        }
        tweet.interactions = {reply, retweet, like};

        return tweet;
    }
    findAllRecords(page: Page): Promise<Locator[]> {
        return page.getByTestId('primaryColumn').getByTestId('tweet').all();
    }
    isParsableUrl(uri: URI): boolean {
        return uri.host() === "twitter.com";
    }
}

export class Tweet extends BaseEntity {
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

export class TweetConsoleLogger implements IContentWriter<Tweet> {
    log(t: Tweet): void {
        console.log(`\n!FOUND_NEW_TWEET! uid=${t.uid}, isAd=${t.isAd ? "Y" : "N"}, time=${t.time}, user=${t.username}${t.hasQuote ? `\n!!QUOTE!!: uid=${t.quote.uid} user=${t.quote.username} TEXT:${t.quote.content}`:''}\n!!TEXT!!:${t.content}\n${JSON.stringify(t.interactions)}`);
    }
}