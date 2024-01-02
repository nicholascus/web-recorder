import { MongoClient } from 'mongodb';
import BaseEntity from '../base/BaseEntity';
import IContentWriter from '../base/IContentWriter';
import ComponentLoader from '../engine/ComponentLoader';

export class MongoDbWriter<T extends BaseEntity> implements IContentWriter<T> {
    private client: MongoClient;
    private async getClient() {
        const connectionString: string =
            ComponentLoader.getInstance().getComponentConfigString(
                'MongoDbWriter',
                'connection_string',
                'mongodb://127.0.0.1:27017/bopilot',
            );
        if (!this.client) {
            this.client = await MongoClient.connect(connectionString);
        }
        return this.client;
    }

    async log(record: T): Promise<void> {
        (await this.getClient()).db().collection('data').insertOne(record);
    }
}
