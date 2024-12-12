import { Injectable } from '@nestjs/common';
import { RangeManagerService } from '../range-manager/range-manager.service';

@Injectable()
export class RandomizerService {
  private readonly BASE62_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private readonly BASE = this.BASE62_CHARACTERS.length;

  constructor(private readonly rangeManager: RangeManagerService) {}

  private encodeToBase62(num: number): string {
    let base62 = '';
    let n = num;

    do {
      base62 = this.BASE62_CHARACTERS[n % this.BASE] + base62;
      n = Math.floor(n / this.BASE);
    } while (n > 0);

    return base62;
  }

  async generateShortString(): Promise<string> {
    const number = await this.rangeManager.getNextNumber();
    return this.encodeToBase62(number);
  }
}
