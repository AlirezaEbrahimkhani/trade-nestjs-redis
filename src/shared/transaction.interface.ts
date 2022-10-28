import { IStackHolder } from './stack-holder.interface';

export interface ITransaction {
  date: Date;
  requestedCount: number;
  stackHolder: IStackHolder;
}
