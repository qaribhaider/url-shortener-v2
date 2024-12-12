import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { KeyValStoreService } from '../common/key-val-store/key-val-store.service';

@Injectable()
export class EtcdHealthIndicator extends HealthIndicator {
  constructor(private readonly keyValStore: KeyValStoreService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.keyValStore.get('health');
      return this.getStatus(key, true);
    } catch (e) {
      return this.getStatus(key, false, { message: e.message });
    }
  }
}
