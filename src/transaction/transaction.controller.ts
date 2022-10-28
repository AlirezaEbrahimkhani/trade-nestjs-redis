import {
  Controller,
  Post,
  Body,
  CACHE_MANAGER,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

import { startOfDay } from 'date-fns';
import {
  IStackHolder,
  ISymbol,
  ISymbolDTO,
  ITransaction,
  ITransactionDTO,
  ListName,
} from 'src/shared';

@Controller('transaction')
export class TransactionController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Post()
  async buySymbol(@Body() transactionDTO: ITransactionDTO) {
    const stackHolders: IStackHolder[] = await this.cacheManager.get(
      ListName.STACK_HOLDERS,
    );
    let specificStackHolder: IStackHolder = await this.cacheManager.get(
      transactionDTO.stackId,
    );
    const symbols: ISymbol[] = await this.cacheManager.get(ListName.SYMBOLS);
    let specificSymbol: ISymbol = await this.cacheManager.get(
      transactionDTO.symbolId,
    );

    if (!specificStackHolder || !specificSymbol)
      throw new InternalServerErrorException(
        'Symbol or stack holder not found !',
      );

    const requestedCount: number = Math.floor(
      transactionDTO.amount / specificSymbol.price,
    );
    const isValidTransaction: boolean =
      requestedCount <= specificSymbol.remainingCount;

    if (isValidTransaction) {
      // Stack Holder Data Manipulation
      const stackHolderSymbols: string[] = specificStackHolder.symbols;
      stackHolderSymbols.push(specificSymbol.id);

      specificStackHolder = {
        ...specificStackHolder,
        symbols: stackHolderSymbols,
      };

      await this.cacheManager.set(specificStackHolder.id, specificStackHolder);

      const stackHolderIndex: number = stackHolders.findIndex(
        (stack) => stack.id === transactionDTO.stackId,
      );
      stackHolders[stackHolderIndex] = specificStackHolder;

      await this.cacheManager.set(ListName.STACK_HOLDERS, stackHolders);

      // Symbol Data Manipulation

      const symbolStackHolder: any[] = specificSymbol.stackHolders ?? [];

      const stackHolderInSymbol = symbolStackHolder.find(
        (stack) => stack.id === transactionDTO.stackId,
      );

      if (!stackHolderInSymbol) symbolStackHolder.push(specificStackHolder);

      const transaction: ITransaction = {
        date: new Date(),
        requestedCount,
        stackHolder: specificStackHolder,
      };

      const transactions: ITransaction[] = specificSymbol.transactions ?? [];
      transactions.push(transaction);

      specificSymbol = {
        ...specificSymbol,
        transactions,
        remainingCount: specificSymbol.remainingCount - requestedCount,
        stackHolders: symbolStackHolder,
      };

      await this.cacheManager.set(specificSymbol.id, specificSymbol);

      const symbolIndex = symbols.findIndex(
        (symbol) => symbol.id === transactionDTO.symbolId,
      );
      symbols[symbolIndex] = specificSymbol;

      await this.cacheManager.set(ListName.SYMBOLS, symbols);

      // End Date Data Manipulation

      const date = startOfDay(new Date());
      const daySymbols: any[] = (await this.cacheManager.get('' + date)) ?? [];

      const daySymbolIndex = daySymbols.findIndex(
        (symbol) => symbol.id === specificSymbol.id,
      );

      if (daySymbolIndex !== -1)
        daySymbols[daySymbolIndex] = {
          id: specificSymbol.id,
          name: specificSymbol.name,
          remainingCount: specificSymbol.remainingCount,
          price: specificSymbol.price,
        };
      else
        daySymbols.push({
          id: specificSymbol.id,
          name: specificSymbol.name,
          remainingCount: specificSymbol.remainingCount,
          price: specificSymbol.price,
        });

      await this.cacheManager.set('' + date, daySymbols);

      return { status: 'Ok' };
    } else
      throw new InternalServerErrorException('Not enough count of symbol!');
  }
}
