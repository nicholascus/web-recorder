import { plainToClass } from 'class-transformer';
class JsonConfig {
    sourceDirs?: string[];
    components?: { name: string; config: { param: string; value: string }[] }[];
    parsers: { parser: string; logger: string }[];
    
    public getComponentConfig(name: string): { param: string; value: string }[] {
        const componentConfig = (config.components ?? []).filter(
            v => v.name === name,
        );
        return componentConfig.length > 0 ? componentConfig[0].config : [];
    }
    
    public setComponentConfig(name: string, param: string, value: string) {
        const componentConfig = this.getComponentConfig(name);
        const config = componentConfig.filter(v => v.param === param)[0];
        if (config) {
            config.value = value;
        } else {
            componentConfig.push({ param, value });
        }
    }
}

export let config: JsonConfig;

config || loadJsonConfig('../../default-config.json');

export function loadJsonConfig(configFile: string) {
    config = plainToClass(JsonConfig, require(configFile));
}
