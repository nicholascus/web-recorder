import path from 'path';
import ComponentLoaderTestable from './ComponentLoaderTestable';
import { MockClass } from './mock-path/MockClass';

describe('ComponentLoader', () => {
    let componentLoader: ComponentLoaderTestable;
    let classImportPath: string;
    beforeEach(() => {
        componentLoader = ComponentLoaderTestable.getInstance();
        classImportPath = path.resolve(__dirname, 'mock-path', 'MockClass');
    });

    describe('instantiateClassFromPath', () => {
        it.each(['MockClass', 'MockAnotherClass'])(
            'should instantiate class from path',
            async className => {
                const instance =
                    await componentLoader.instantiateClassFromPathTest(
                        [classImportPath],
                        className,
                    );

                expect(componentLoader.getClassCache().get(className)).toBe(
                    `${classImportPath}`,
                );
            },
        );

        it('should use cached path if available', async () => {
            componentLoader.setClassCache([
                { className: 'MockClass', path: classImportPath },
            ]);

            const instance = await componentLoader.instantiateClassFromPathTest(
                [],
                'MockClass',
            );

            expect(instance).toBeInstanceOf(MockClass);
        });

        it('should throw error if class cannot be instantiated', async () => {
            await expect(
                componentLoader.instantiateClassFromPathTest(
                    [classImportPath],
                    'NonExistentClass',
                ),
            ).rejects.toThrow('Error instantiating class: NonExistentClass');
        });
    });
});
