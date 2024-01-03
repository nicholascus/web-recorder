import path from 'path';
import IWebParser from '../base/IWebParser';
import { config } from './JsonConfig';
import IContentWriter from '../base/IContentWriter';

let instance = null;

export default class ComponentLoader {
    protected classCache = new Map<string, any>();

    protected constructor() {}

    protected async instantiateClassFromPath<T>(
        paths: string[],
        className: string,
    ): Promise<T | undefined> {
        if (this.classCache.has(className)) {
            paths = [this.classCache.get(className), ...paths];
        }
        const errors = [];
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            try {
                const module = await import(path);
                const ClassReference = module[className] as { new (): T };
                if (ClassReference) {
                    const parser = new ClassReference();
                    this.classCache.set(className, path);
                    return parser;
                }
            } catch (error) {
                errors.push(error);
            }
        }
        throw Error(`Error instantiating class: ${className}, ${path}`);
    }

    protected getSearchDirs(fileName: string) {
        return [
            '.',
            path.resolve(__dirname, `../parsers`),
            path.resolve(__dirname, `../writers`),
            ...(config.sourceDirs ?? []),
        ].map(v => `${v}/${fileName}`);
    }

    async loadParser<T>(parserClassName: string): Promise<T | undefined> {
        const paths = this.getSearchDirs(parserClassName);
        return this.instantiateClassFromPath<T>(paths, parserClassName);
    }

    async loadLogger<T>(
        loggerClassName: string,
        parserClassName: string,
    ): Promise<T | undefined> {
        const paths = [
            ...([this.classCache.get(parserClassName)] ?? []),
            ...this.getSearchDirs(loggerClassName),
        ];
        try {
            return this.instantiateClassFromPath<T>(paths, loggerClassName);
        } catch (e) {}
    }

    async getParsers(): Promise<IWebParser<any>[]> {
        const parsers: IWebParser<any>[] = [];
        for (var i = 0; i < config.parsers.length; i++) {
            const parserClassName = config.parsers[i].parser;
            const parser =
                await this.loadParser<IWebParser<any>>(parserClassName);

            const loggerClassName = config.parsers[i].logger;
            const logger = loggerClassName
                ? await this.loadLogger<IContentWriter<any>>(
                      loggerClassName,
                      parserClassName,
                  )
                : undefined;

            parser.setContentWriter(logger);
            parsers.push(parser);
        }
        return parsers;
    }

    getComponentConfigString(
        name: string,
        param: string,
        def?: string,
    ): string | undefined {
        const componentConfig = this.getComponentConfig(name);
        return componentConfig.filter(v => v.param === param)[0]?.value ?? def;
    }

    getComponentConfig(name: string): { param: string; value: string }[] {
        const componentConfig = (config.components ?? []).filter(
            v => v.name === name,
        );
        return componentConfig.length ? componentConfig[0].config : [];
    }

    static getInstance(): ComponentLoader {
        if (!instance) {
            instance = new ComponentLoader();
        }
        return instance;
    }
}
