import path from 'path';
import IWebParser from '../base/IWebParser';
import { config } from './JsonConfig';

export default class ComponentLoader {
    private classCache = new Map<string, any>();
    private async instantiateClassFromPath<T>(paths: string | string[], fileName: string, className: string = undefined): Promise<T | undefined> {
        className = className ?? fileName;
        if (typeof paths === 'string') {
            paths = [paths];
        }
        if (this.classCache.has(fileName)) {
            paths = [this.classCache.get(fileName)];
        }
        const errors = [];
        for(let i=0; i<paths.length; i++) {
            const path = paths[i];
            try {
                const module = await import(`${path}/${fileName}`);
                const ClassReference = module[fileName] as { new (): T };
                const parser = new ClassReference();
                this.classCache.set(className, path);
                return parser;
            } catch (error) {
                errors.push(error);
            }
        }
        throw Error(`Error instantiating class: ${className}, ${JSON.stringify({path, errors})}`);
    }

    async getParsers(): Promise<IWebParser<any>[]> {
        const parsers: IWebParser<any>[] = [];
        for(var i=0; i<config.parsers.length; i++) {
            const parserClassName = config.parsers[i].parser;
            const parser = await this.instantiateClassFromPath<IWebParser<any>>(['.', path.resolve(__dirname, `../parsers/`), ...(config.sourceDirs??[]) ], parserClassName);
            parser.setContentWriter();
            parsers.push(parser);
        }
        return parsers;
    }
}