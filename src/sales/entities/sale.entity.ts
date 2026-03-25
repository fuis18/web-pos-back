export interface Sale {
  id: number;
  date: Date;
  total: number;
}

export interface SaleListItem {
  id: number;
  date: Date;
  total: number;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  priceAtSale: number;
  product?: { name: string; code: number };
}

export interface SaleWithItems extends Sale {
  saleItems: SaleItem[];
}

export interface SaleReport {
  id: number;
  saleId: number;
  reason: string;
  reportedAt: Date;
}
