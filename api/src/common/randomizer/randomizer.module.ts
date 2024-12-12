import { Module } from '@nestjs/common';
import { RandomizerService } from './randomizer.service';
import { RangeManagerModule } from '../range-manager/range-manager.module';

@Module({
  imports: [RangeManagerModule],
  providers: [RandomizerService],
  exports: [RandomizerService],
})
export class RandomizerModule {}
