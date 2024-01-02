import { Locator, Page } from 'playwright';
import URI from 'urijs';
import AbstractWebParser from '../base/AbastractWebParser';
import BaseEntity from '../base/BaseEntity';
import { mapAsyncSequential } from '../engine/Util';
import IContentWriter from '../base/IContentWriter';

export class LinkedInJobCollections extends AbstractWebParser<Job> {
    protected readonly Writer = LinkedInJobConsoleLogger;

    async extractUid(page: Page, element: Locator): Promise<string> {
        const job_link: Locator = element.locator('xpath=/descendant::*[contains(@class, "artdeco-entity-lockup__title")]/descendant::a');
        const job_url = new URI(await job_link.getAttribute('href'));
        return job_url.pathname();
    }
    async extractFullRecord(page: Page, element: Locator): Promise<Job> {
        const job = new Job();
        const job_link: Locator = element.locator('xpath=/descendant::*[contains(@class, "artdeco-entity-lockup__title")]/descendant::a');
        job.title = await job_link.innerText();
        const job_url = new URI(await job_link.getAttribute('href'));
        job.uid = job_url.pathname();
        job.link = `https://linkedin.com${job_url.pathname()}`;

        job.company = await element.locator('xpath=/descendant::*[contains(@class, "job-card-container__primary-description")]').innerText();

        job.meta = await mapAsyncSequential(
            await element.locator('xpath=/descendant::*[contains(@class, "job-card-container__metadata-item")]').all(),
            async (e) => await e.innerText()
        );

        job.time = await element.locator('xpath=/descendant::time').getAttribute('datetime');
        return job;
    }
    findAllRecords(page: Page): Promise<Locator[]> {
        return page.locator('.scaffold-layout__list-container').locator('xpath=/descendant::*[@data-occludable-job-id]').all();
    }
    isParsableUrl(uri: URI): boolean {
        return (uri.host() === "linkedin.com" || uri.host() === "www.linkedin.com") && uri.pathname().startsWith("/jobs/collections");
    }    
}

class Job extends BaseEntity {
    time: string;
    title: string;
    company: string;
    meta: string[];
    link: string;
}

export class LinkedInJobConsoleLogger implements IContentWriter<Job> {
    log(j: Job): void {
        console.log(`\n!FOUND_NEW_JOB! uid=${j.uid}, time=${j.time}, title=${j.title}, company=${j.company}, meta=${JSON.stringify(j.meta)}, date=${j.time}`);    
    }
}
