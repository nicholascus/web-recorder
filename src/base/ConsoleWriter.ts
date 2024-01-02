import IContentWriter from "./IContentWriter";
import BaseEntity from "./BaseEntity";

class ConsoleWriter<T extends BaseEntity> implements IContentWriter<T> {
    log(record: T): void {
        console.log(JSON.stringify(record));
    }
}