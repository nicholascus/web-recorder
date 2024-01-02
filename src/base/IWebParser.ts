import type { Page } from 'playwright-core';
import URI from 'urijs';
import BaseEntity from './BaseEntity';
import IContentWriter from './IContentWriter';

export default interface IWebParser<T extends BaseEntity> {
    isParsableUrl(uri: URI): boolean;
    parsePage(page: Page): Promise<void>;
    setContentWriter(data?: IContentWriter<T>): void;
}
