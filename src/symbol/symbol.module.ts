import { Module } from '@nestjs/common';
import { SymbolController } from './symbol.controller';

@Module({
  controllers: [SymbolController],
})
export class SymbolModule {}
