import { Injectable, OnModuleInit } from '@nestjs/common';
import { KeyValStoreService } from '../key-val-store/key-val-store.service';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RangeManagerService implements OnModuleInit {
  private readonly RANGE_STEP = 1000;
  private readonly RANGE_KEY = 'url_range_max';
  private readonly INITIAL_START = 10000;
  private currentMin: number;
  private currentMax: number;
  private counter: number;

  constructor(
    private readonly keyValStore: KeyValStoreService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.allocateRange();
  }

  private async allocateRange(): Promise<void> {
    const currentMaxStr = await this.keyValStore.get(this.RANGE_KEY);
    const currentMax = currentMaxStr ? parseInt(currentMaxStr, 10) : this.INITIAL_START;

    this.currentMin = currentMax + 1;
    this.currentMax = this.currentMin + this.RANGE_STEP - 1;
    this.counter = this.currentMin;

    await this.keyValStore.put(this.RANGE_KEY, this.currentMax.toString());

    this.logger.log({
      message: 'Allocated new range for URL shortening',
      currentMin: this.currentMin,
      currentMax: this.currentMax,
      rangeSize: this.RANGE_STEP,
    });
  }

  async getNextNumber(): Promise<number> {
    if (this.counter > this.currentMax) {
      await this.allocateRange();
    }
    return this.counter++;
  }

  getCurrentRange(): { min: number; max: number } {
    return {
      min: this.currentMin,
      max: this.currentMax,
    };
  }

  isHealthy(): boolean {
    return this.counter <= this.currentMax;
  }
}
