import BaseEntity from '../base/BaseEntity';
import ConsoleWriter from '../base/ConsoleWriter';
import IContentWriter from '../base/IContentWriter';
import IWebParser from '../base/IWebParser';
import { config } from './JsonConfig';

async function instantiateClassFromPath<T>(folder: string, className: string): Promise<T | undefined> {
    try {
        const module = await import(`../parsers/${className}`);
        const ClassReference = module[className] as { new (): T };
        const parser = new ClassReference();
        return parser;
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
            const parser = await instantiateClassFromPath<IWebParser>(`../parsers/${parserClassName}`, parserClassName);
            parser.setContentWriter();
            parsers.push(parser);
        }
        return parsers;
    }
}