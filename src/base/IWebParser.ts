import { Locator, Page } from "playwright";
import URI from 'urijs';

export default interface IWebParser {
    isParsableUrl(uri: URI): boolean;
    parsePage(page: Page): Promise<void>;
}