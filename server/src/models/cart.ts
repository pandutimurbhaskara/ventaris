export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CartItemView {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemView[];
  subtotal: number;
  itemCount: number;
}
