import { Module } from '@nestjs/common';
import { StackHolderController } from './stack-holder.controller';

@Module({
  controllers: [StackHolderController],
})
export class StackHolderModule {}
