import { Locator, Page } from "playwright";
import URI from 'urijs';
import BaseEntity from "./BaseEntity";
import IContentWriter from "./IContentWriter";

export default interface IWebParser {
    isParsableUrl(uri: URI): boolean;
    parsePage(page: Page): Promise<void>;
    setContentWriter(): void;
}