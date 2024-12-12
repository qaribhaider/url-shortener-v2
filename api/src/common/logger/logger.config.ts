import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/environment.config';

export const LoggerConfig = LoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService<AppConfig>) => {
    const isDevelopment = config.get('environment') === 'development';

    return {
      pinoHttp: {
        level: config.get('logLevel'),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: isDevelopment,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            messageFormat: '{msg}',
            ignore: 'pid,hostname',
            levelLabel: 'level',
            customLevels: {
              trace: 10,
              debug: 20,
              info: 30,
              warn: 40,
              error: 50,
              fatal: 60,
            },
            useOnlyCustomProps: true,
          },
        },
        customProps: (req) => {
          return {
            traceId: req['traceId'],
          };
        },
      },
    };
  },
});
