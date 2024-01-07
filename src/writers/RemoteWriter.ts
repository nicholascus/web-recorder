import BaseEntity from '../base/BaseEntity';
import IContentWriter from '../base/IContentWriter';
import ComponentLoader from '../engine/ComponentLoader';
import axios from 'axios';
import { logger } from '../engine/logger';

export class RemoteWriter<T extends BaseEntity> implements IContentWriter<T> {
    private apiEndpoint: string;
    private apiKeySecret: string;
    private getClient() {
        if (!this.apiEndpoint) {
            this.apiEndpoint =
                ComponentLoader.getInstance().getComponentConfigString(
                    'RemoteWriter',
                    'server_content_endpoint',
                    'http://127.0.0.1/api/content',
                );
            this.apiKeySecret =
                ComponentLoader.getInstance().getComponentConfigString(
                    'RemoteWriter',
                    'api_secret',
                    'test1234',
                );
        }
    }

    async log(record: T): Promise<void> {
        try {
            this.getClient(); //TODO: need to decide on what stage config is loaded, should all components have contructors?
            const response = await axios.post(
                this.apiEndpoint,
                JSON.stringify(record),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': this.apiKeySecret,
                    },
                },
            );
        } catch (error) {
            logger.error(error, 'Failed to POST to remote server');
        }
    }
}
