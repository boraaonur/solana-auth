import { HttpsError } from "firebase-functions/v2/https";

export const INVALID_INPUT_ERROR = new HttpsError(
  "invalid-argument",
  "Invalid input. Missing publicKey or signature."
);
export const USER_DOES_NOT_EXIST_ERROR = new HttpsError(
  "not-found",
  "User document does not exist."
);
export const SIGNATURE_VERIFICATION_ERROR = new HttpsError(
  "unauthenticated",
  "Signature could not be verified."
);

export const INVALID_PUBLIC_KEY_ERROR = new HttpsError(
  "invalid-argument",
  "Provided UID/PublicKey is not valid for Solana"
);

export const FAILED_PRECONDITION_ERROR = new HttpsError(
  "failed-precondition",
  "The function must be called from an App Check verified app."
);
