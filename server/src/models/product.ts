export interface Product {
  id: number;
  name: string;
  description: string;
  /** IDR, integer (no fractional rupiah in this demo). */
  price: number;
  stock: number;
  image: string;
}

/** Row shape as stored/returned by better-sqlite3 (snake_case column names). */
export interface ProductRow {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    image: row.image,
  };
}
