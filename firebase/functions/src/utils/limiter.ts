import FirebaseFunctionsRateLimiter from "@omgovich/firebase-functions-rate-limiter";
import * as admin from "firebase-admin";

export const limiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
  {
    name: "limiter",
    maxCalls: 100,
    periodSeconds: 3600,
  },
  admin.firestore()
);
