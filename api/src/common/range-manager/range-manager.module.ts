import { Module } from '@nestjs/common';
import { RangeManagerService } from './range-manager.service';
import { KeyValStoreModule } from '../key-val-store/key-val-store.module';

@Module({
  imports: [KeyValStoreModule],
  providers: [RangeManagerService],
  exports: [RangeManagerService],
})
export class RangeManagerModule {}
