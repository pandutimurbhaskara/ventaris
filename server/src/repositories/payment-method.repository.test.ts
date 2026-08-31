import test from "node:test";
import assert from "node:assert/strict";

import { findAllPaymentMethods, findPaymentMethodById } from "./payment-method.repository";

test("exposes the four demo payment methods", () => {
  const ids = findAllPaymentMethods().map((method) => method.id);
  assert.deepEqual(ids, ["bank_transfer", "e_wallet", "credit_card", "cod"]);
});

test("findPaymentMethodById returns the matching method", () => {
  assert.deepEqual(findPaymentMethodById("cod"), { id: "cod", name: "Cash on Delivery" });
});

test("findPaymentMethodById returns undefined for an unknown id", () => {
  assert.equal(findPaymentMethodById("crypto"), undefined);
});
