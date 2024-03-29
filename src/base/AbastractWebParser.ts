import { Locator, Page } from 'playwright-core';
import BaseEntity from './BaseEntity';
import IContentWriter from './IContentWriter';
import IWebParser from './IWebParser';
import URI from 'urijs';
import { ConsoleWriter } from '../writers/ConsoleWriter';

export default abstract class AbstractWebParser<T extends BaseEntity>
    implements IWebParser<T>
{
    protected readonly Writer = ConsoleWriter<T>;

    uidProcessed: Set<string> = new Set<string>();
    contentWriter: IContentWriter<T>;

    abstract extractUid(page: Page, element: Locator): Promise<string>;
    abstract extractFullRecord(page: Page, element: Locator): Promise<T>;
    abstract isParsableUrl(uri: URI): boolean;
    abstract findAllRecords(page: Page): Promise<Locator[]>;

    isNewElement(uid: string) {
        return !this.uidProcessed.has(uid);
    }

    saveElement(element: T) {
        if (this.isNewElement(element.uid)) {
            this.contentWriter && this.contentWriter.log(element);
            this.uidProcessed.add(element.uid);
        }
    }

    async parsePageElement(page: Page, element: Locator): Promise<void> {
        try {
            const uid: string = await this.extractUid(page, element);
            if (this.isNewElement(uid)) {
                const record: T = await this.extractFullRecord(page, element);
                this.saveElement(record);
            }
        } catch (e) {}
    }

    async parsePage(page: Page) {
        try {
            const elements: Locator[] = await this.findAllRecords(page);
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                await this.parsePageElement(page, element);
            }
        } catch (e) {}
    }

    setContentWriter(contentWriter?: IContentWriter<T>): void {
        this.contentWriter = contentWriter ?? new this.Writer();
    }
}
