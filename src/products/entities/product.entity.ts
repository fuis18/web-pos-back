export interface Product {
  id: number;
  code: number;
  name: string;
  price: number;
  state: boolean;
}

export interface ProductListItem {
  id: number;
  code: number;
  name: string;
  price: number;
}

export interface BatchPayload {
  count: number;
}
