import BaseEntity from './BaseEntity';

export default interface IContentWriter<T extends BaseEntity> {
    log(record: T): void;
}
