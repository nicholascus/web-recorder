import { plainToClass } from 'class-transformer';
class JsonConfig {
    sourceDirs?: string[];
    parsers: { parser: string, loggers: string[] | string }[];
}

export const config: JsonConfig = plainToClass(JsonConfig, require('../../default-config.json'));