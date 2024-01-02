import ComponentLoader from '../ComponentLoader';

export default class ComponentLoaderTestable extends ComponentLoader {
    static getInstance() {
        return new ComponentLoaderTestable();
    }

    instantiateClassFromPathTest<T>(
        paths: string[],
        className: string,
    ): Promise<T | undefined> {
        return this.instantiateClassFromPath<T>(paths, className);
    }

    getSearchDirsTest(fileName: string) {
        return this.getSearchDirs(fileName);
    }

    getClassCache() {
        return this.classCache;
    }
}
