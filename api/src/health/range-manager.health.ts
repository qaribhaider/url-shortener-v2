import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RangeManagerService } from '../common/range-manager/range-manager.service';

@Injectable()
export class RangeManagerHealthIndicator extends HealthIndicator {
  constructor(private readonly rangeManagerService: RangeManagerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.rangeManagerService.isHealthy();
    const range = this.rangeManagerService.getCurrentRange();

    const result = this.getStatus(key, isHealthy, {
      currentMin: range.min,
      currentMax: range.max,
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('RangeManager check failed', result);
  }
}
