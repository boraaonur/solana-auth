import { FAILED_PRECONDITION_ERROR, INVALID_PUBLIC_KEY_ERROR } from "./errors";

var WAValidator = require("multicoin-address-validator");

export const validateContextApp = (ctx: any) => {
  if (ctx.app == undefined) {
    throw FAILED_PRECONDITION_ERROR;
  }
};

export const isValidPublicKey = (publicKey: string): boolean => {
  if (!publicKey || typeof publicKey !== "string") {
    throw INVALID_PUBLIC_KEY_ERROR;
  }
  return WAValidator.validate(publicKey, "sol");
};
