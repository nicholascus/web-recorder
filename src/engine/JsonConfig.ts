import { plainToClass } from 'class-transformer';
class JsonConfig {
    sourceDirs?: string[];
    components?: { name: string; config: { param: string; value: string }[] }[];
    parsers: { parser: string; logger: string }[];
}

export let config: JsonConfig;

config || loadJsonConfig('../../default-config.json');

export function loadJsonConfig(configFile: string) {
    config = plainToClass(JsonConfig, require(configFile));
}
