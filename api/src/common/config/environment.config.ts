import * as Joi from 'joi';

export interface AppConfig {
  port: number;
  logLevel: string;
  environment: string;
  redis: {
    host: string;
    port: number;
  };
  etcd: {
    hosts: string[];
  };
  mongodbUri: string;
}

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  ENVIRONMENT: Joi.string().valid('development', 'test', 'production').default('development'),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  ETCD_HOSTS: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
});

export default (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  environment: process.env.ENVIRONMENT || 'development',
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  etcd: {
    hosts: (process.env.ETCD_HOSTS || '').split(','),
  },
  mongodbUri: process.env.MONGODB_URI,
});
