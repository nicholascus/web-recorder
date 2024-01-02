import IContentWriter from "../base/IContentWriter";
import BaseEntity from "../base/BaseEntity";

export class ConsoleWriter<T extends BaseEntity> implements IContentWriter<T> {
    log(record: T): void {
        console.log(JSON.stringify(record));
    }
}
