import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

import { IStackHolder, IStackHolderDTO, ListName } from 'src/shared';
import { v4 as uuid } from 'uuid';

@Controller('stack')
export class StackHolderController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get()
  async getAllStackHolders() {
    const stacks: IStackHolder[] = await this.cacheManager.get(
      ListName.STACK_HOLDERS,
    );
    return stacks ?? [];
  }

  @Get('/:id')
  async getSingleStackHolder(@Param('id') stackId: string) {
    const stack: IStackHolder = await this.cacheManager.get(stackId);
    return stack;
  }

  @Post()
  async createStackHolder(@Body() stackDTO: IStackHolderDTO) {
    const id = uuid();
    const stack: IStackHolder = { id, ...stackDTO, symbols: [] };
    const res = await this.cacheManager.set(id, stack);

    const stacks: IStackHolder[] =
      (await this.cacheManager.get(ListName.STACK_HOLDERS)) ?? [];
    stacks.push(stack);
    await this.cacheManager.set(ListName.STACK_HOLDERS, stacks);

    return { status: res, id };
  }
}
