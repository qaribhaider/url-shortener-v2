import { Module } from '@nestjs/common';
import { KeyValStoreService } from './key-val-store.service';

@Module({
  providers: [KeyValStoreService],
  exports: [KeyValStoreService],
})
export class KeyValStoreModule {}
