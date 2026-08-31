import test from "node:test";
import assert from "node:assert/strict";

import { HttpError } from "./http-error";

test("badRequest defaults to 400 with a generic message", () => {
  const err = HttpError.badRequest();
  assert.equal(err.status, 400);
  assert.equal(err.message, "Bad Request");
  assert.equal(err.details, undefined);
});

test("notFound defaults to 404", () => {
  assert.equal(HttpError.notFound().status, 404);
});

test("conflict defaults to 409 and carries a custom message/details", () => {
  const err = HttpError.conflict("out of stock", { productId: 1 });
  assert.equal(err.status, 409);
  assert.equal(err.message, "out of stock");
  assert.deepEqual(err.details, { productId: 1 });
});

test("is an Error instance named HttpError", () => {
  const err = HttpError.badRequest("bad");
  assert.ok(err instanceof Error);
  assert.equal(err.name, "HttpError");
});
