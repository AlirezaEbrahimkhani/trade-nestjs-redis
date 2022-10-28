export interface ISymbol {
  id: string;
  name: string;
  price: number;
  stackHolders: any[];
  remainingCount: number;
  transactions: any[];
}
