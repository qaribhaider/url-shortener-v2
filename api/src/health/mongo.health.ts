import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (this.connection.readyState === 1) {
        return this.getStatus(key, true);
      }
      throw new Error('MongoDB connection is not ready');
    } catch (error) {
      throw new HealthCheckError('MongoHealthCheck failed', this.getStatus(key, false, { message: error.message }));
    }
  }
}
