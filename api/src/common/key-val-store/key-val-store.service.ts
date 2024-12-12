import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Etcd3 } from 'etcd3';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/environment.config';

@Injectable()
export class KeyValStoreService implements OnModuleInit, OnModuleDestroy {
  private client: Etcd3;

  constructor(private configService: ConfigService<AppConfig>) {
    const etcdConfig = this.configService.get('etcd', { infer: true });
    this.client = new Etcd3({
      hosts: etcdConfig.hosts,
    });
  }

  async onModuleInit() {
    try {
      await this.client.maintenance.status();
    } catch (error) {
      throw new Error(`etcd connection failed: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key).string();
  }

  async getNumber(key: string): Promise<number | null> {
    return this.client.get(key).number();
  }

  async put(key: string, value: string | number): Promise<void> {
    await this.client.put(key).value(value.toString());
  }

  async delete(key: string): Promise<void> {
    await this.client.delete().key(key);
  }
}
