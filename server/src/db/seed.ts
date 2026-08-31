import { db } from "./client";

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

function placeholderImage(slug: string, label: string): string {
  return `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(label)}&font=roboto`;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Wireless Headphones",
    description: "Over-ear Bluetooth 5.3 headphones with active noise cancellation and 30-hour battery life.",
    price: 450000,
    stock: 25,
    image: placeholderImage("wireless-headphones", "Wireless Headphones"),
  },
  {
    name: "Mechanical Keyboard",
    description: "Hot-swappable 75% mechanical keyboard with tactile brown switches and RGB backlighting.",
    price: 750000,
    stock: 15,
    image: placeholderImage("mechanical-keyboard", "Mechanical Keyboard"),
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic 2.4GHz wireless mouse with silent clicks and adjustable DPI up to 4000.",
    price: 150000,
    stock: 40,
    image: placeholderImage("wireless-mouse", "Wireless Mouse"),
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI 4K, 3x USB 3.0, SD/microSD, and 100W power delivery pass-through.",
    price: 275000,
    stock: 30,
    image: placeholderImage("usb-c-hub", "USB-C Hub"),
  },
  {
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand, foldable and portable, fits 10-17 inch laptops.",
    price: 180000,
    stock: 20,
    image: placeholderImage("laptop-stand", "Laptop Stand"),
  },
  {
    name: "27-inch Monitor",
    description: "27-inch QHD (2560x1440) IPS monitor, 100Hz refresh rate, USB-C connectivity.",
    price: 2800000,
    stock: 10,
    image: placeholderImage("27-inch-monitor", "27-inch Monitor"),
  },
  {
    name: "HD Webcam",
    description: "1080p USB webcam with autofocus, built-in dual microphones, and privacy shutter.",
    price: 320000,
    stock: 18,
    image: placeholderImage("hd-webcam", "HD Webcam"),
  },
  {
    name: "Travel Backpack",
    description: "Water-resistant 25L travel backpack with padded 15-inch laptop compartment and USB charging port.",
    price: 425000,
    stock: 22,
    image: placeholderImage("travel-backpack", "Travel Backpack"),
  },
  {
    name: "Smartwatch",
    description: "AMOLED smartwatch with heart-rate and SpO2 tracking, GPS, and 10-day battery life.",
    price: 1200000,
    stock: 12,
    image: placeholderImage("smartwatch", "Smartwatch"),
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable IPX7 waterproof Bluetooth speaker with 360-degree sound and 20-hour playtime.",
    price: 550000,
    stock: 28,
    image: placeholderImage("bluetooth-speaker", "Bluetooth Speaker"),
  },
];

/** Seeds demo products only when the table is empty — safe to call on every boot. */
export function seed(): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO products (name, description, price, stock, image) VALUES (@name, @description, @price, @stock, @image)",
  );
  const insertAll = db.transaction((products: SeedProduct[]) => {
    for (const product of products) insert.run(product);
  });

  insertAll(PRODUCTS);
}
