// FILEPATH: /Users/niko/dev/playwright-copilot-plain/src/engine/__tests__/ComponentLoader.test.ts
import path from 'path';
import ComponentLoaderTestable from './ComponentLoaderTestable';

describe('ComponentLoader', () => {
    let componentLoader: ComponentLoaderTestable;
    beforeEach(() => {
        componentLoader = ComponentLoaderTestable.getInstance();
    });

    describe('instantiateClassFromPath', () => {
        it('should instantiate class from path', async () => {
            const classFolderPath = path.resolve(
                __dirname,
                'mock-path',
                'MockClass',
            );
            const instance = await componentLoader.instantiateClassFromPathTest(
                [classFolderPath],
                'MockClass',
            );

            expect(componentLoader.getClassCache().get('MockClass')).toBe(
                `${classFolderPath}`,
            );
        });

        // it('should use cached path if available', async () => {
        // });

        // it('should throw error if class cannot be instantiated', async () => {
        // });
    });
});
