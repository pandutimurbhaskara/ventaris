import test from "node:test";
import assert from "node:assert/strict";

import { findAllShippingOptions, findShippingOptionById } from "./shipping-option.repository";

test("exposes the three demo shipping options", () => {
  const ids = findAllShippingOptions().map((option) => option.id);
  assert.deepEqual(ids, ["regular", "express", "same_day"]);
});

test("findShippingOptionById returns the matching option", () => {
  assert.deepEqual(findShippingOptionById("express"), {
    id: "express",
    name: "Express",
    price: 30000,
    estimatedDelivery: "1-2 days",
  });
});

test("findShippingOptionById returns undefined for an unknown id", () => {
  assert.equal(findShippingOptionById("teleport"), undefined);
});
