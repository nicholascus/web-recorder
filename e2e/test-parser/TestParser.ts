import { Page, Locator } from 'playwright-core';
import AbstractWebParser from '../../src/base/AbastractWebParser';
import BaseEntity from '../../src/base/BaseEntity';

export class TestParser extends AbstractWebParser<TestDataItem> {
    extractUid(page: Page, element: Locator): Promise<string> {
        return element.getAttribute('data-testid');
    }
    async extractFullRecord(
        page: Page,
        element: Locator,
    ): Promise<TestDataItem> {
        const item = new TestDataItem();
        item.uid = await element.getAttribute('data-testid');
        item.text = await element.innerText();
        return item;
    }
    isParsableUrl(uri: import('urijs')): boolean {
        return true;
    }
    findAllRecords(page: Page): Promise<Locator[]> {
        return page.locator('css=.item').all();
    }
}

export class TestDataItem extends BaseEntity {
    text: string;
}
