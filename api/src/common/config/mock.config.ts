import { AppConfig } from './environment.config';

export const mockConfig: AppConfig = {
  port: 3000,
  logLevel: 'info',
  environment: 'test',
  redis: {
    host: 'localhost',
    port: 6379,
  },
  etcd: {
    hosts: ['http://localhost:2379'],
  },
  mongodbUri: 'mongodb://localhost:27017/url-shortener-test',
};
