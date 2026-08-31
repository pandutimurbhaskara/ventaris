import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  clearCartItems,
  deleteCartItem,
  getCartItemQuantity,
  getCartItems,
  setCartItemQuantity,
} from "./cart.repository";

beforeEach(() => {
  clearCartItems();
});

test("starts empty", () => {
  assert.deepEqual(getCartItems(), []);
});

test("setCartItemQuantity adds a new item, readable via getCartItemQuantity", () => {
  setCartItemQuantity(1, 3);
  assert.equal(getCartItemQuantity(1), 3);
  assert.deepEqual(getCartItems(), [{ productId: 1, quantity: 3 }]);
});

test("setCartItemQuantity overwrites an existing item's quantity", () => {
  setCartItemQuantity(1, 3);
  setCartItemQuantity(1, 5);
  assert.equal(getCartItemQuantity(1), 5);
  assert.equal(getCartItems().length, 1);
});

test("getCartItemQuantity returns undefined for a product not in the cart", () => {
  assert.equal(getCartItemQuantity(999), undefined);
});

test("deleteCartItem removes an item and reports whether it existed", () => {
  setCartItemQuantity(1, 1);
  assert.equal(deleteCartItem(1), true);
  assert.equal(getCartItemQuantity(1), undefined);
  assert.equal(deleteCartItem(1), false);
});

test("clearCartItems empties the cart", () => {
  setCartItemQuantity(1, 1);
  setCartItemQuantity(2, 2);
  clearCartItems();
  assert.deepEqual(getCartItems(), []);
});
