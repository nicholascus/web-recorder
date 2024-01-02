import BaseEntity from '../base/BaseEntity';
import ConsoleWriter from '../base/ConsoleWriter';
import IContentWriter from '../base/IContentWriter';
import IWebParser from '../base/IWebParser';
import { config } from './JsonConfig';

async function instantiateClassFromPath<T>(path: string, className: string): Promise<T | undefined> {
    try {
        const module = await import(path);
        const ClassReference = module[className] as { new (writer: IContentWriter<BaseEntity>): T };
        const consoleWriter = new ConsoleWriter<BaseEntity>()
        return new ClassReference(consoleWriter);
    } catch (error) {
        console.error("Error instantiating class:", error);
        return undefined;
    }
}

export default class ComponentLoader {
    async getParsers(): Promise<IWebParser[]> {
        const parsers: IWebParser[] = [];
        for(var i=0; i<config.parsers.length; i++) {
            const parserClassName = config.parsers[i].parser;
            parsers.push(await instantiateClassFromPath<IWebParser>(`../parsers/${parserClassName}`, parserClassName));
        }
        // const parsers: IWebParser[] = [
        //     new TwitterFeedParser(new TweetConsoleLogger()),
        //     new LinkedInJobCollectionsParser(new LinkedInJobConsoleLogger()),
        // ];
        return parsers;
    }
}