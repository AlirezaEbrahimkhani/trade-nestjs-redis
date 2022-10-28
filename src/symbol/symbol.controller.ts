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

import { startOfDay } from 'date-fns';
import { ISymbol, ISymbolDTO, ListName } from 'src/shared';
import { v4 as uuid } from 'uuid';

@Controller('symbol')
export class SymbolController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get()
  async getAllSymbols() {
    const symbols: ISymbol = await this.cacheManager.get(ListName.SYMBOLS);
    return symbols ?? [];
  }

  @Get('/:id')
  async getSingleSymbol(@Param('id') symbolId: string) {
    const symbol: ISymbol = await this.cacheManager.get(symbolId);
    return symbol;
  }

  @Get('/day/:date')
  async getEndDaySymbols(@Param('date') date: Date) {
    const dayDate = startOfDay(new Date(date));
    const symbols = await this.cacheManager.get('' + dayDate);

    return symbols;
  }

  @Post()
  async createSymbol(@Body() symbolDTO: ISymbolDTO) {
    const id = uuid();
    const symbol: ISymbol = {
      id,
      ...symbolDTO,
      stackHolders: [],
      transactions: [],
    };
    const res = await this.cacheManager.set(id, symbol);

    const symbols: ISymbol[] =
      (await this.cacheManager.get(ListName.SYMBOLS)) ?? [];
    symbols.push(symbol);

    await this.cacheManager.set(ListName.SYMBOLS, symbols);

    return { status: res, id };
  }
}
