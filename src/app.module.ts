import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { SymbolModule } from './symbol/symbol.module';
import { StackHolderModule } from './stack-holder/stack-holder.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 10000,
    }),
    SymbolModule,
    StackHolderModule,
    TransactionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
