import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import verifySignature from "./utils/verify-signature";
import { limiter } from "./utils/limiter";
import {
  SIGNATURE_VERIFICATION_ERROR,
  USER_DOES_NOT_EXIST_ERROR,
  INVALID_INPUT_ERROR,
} from "./utils/errors";
var crypto = require("crypto");

export const authenticate = onCall(async (ctx) => {
  /*  
    validateContextApp(ctx);
    -> I intentionally disabled this since this is a portfolio demo but normally you should use this in prod
  */

  await limiter.rejectOnQuotaExceededOrRecordUsage();

  try {
    const { publicKey, signature } = ctx.data;
    validateInput(publicKey, signature);

    const nonce = await getNonceForUser(publicKey);
    const isSignatureValid = await verifySignature(nonce, publicKey, signature);

    if (isSignatureValid) {
      const newNonce = crypto.randomBytes(32).toString("base64");
      admin
        .firestore()
        .collection("nonces")
        .doc(publicKey)
        .set({ nonce: newNonce });

      const firebaseToken = await admin.auth().createCustomToken(publicKey);
      await updateUserLogin(publicKey);

      return { error: null, token: firebaseToken };
    } else {
      logger.warn(SIGNATURE_VERIFICATION_ERROR.message);
      throw SIGNATURE_VERIFICATION_ERROR;
    }
  } catch (err) {
    logger.error(err);
    throw new HttpsError("unknown", "Something went wrong.");
  }
});

const getNonceForUser = async (publicKey: string): Promise<string> => {
  const userDocRef = admin.firestore().collection("nonces").doc(publicKey);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    logger.warn(USER_DOES_NOT_EXIST_ERROR.message);
    throw USER_DOES_NOT_EXIST_ERROR;
  }

  return userDoc.data()!.nonce;
};

const updateUserLogin = async (publicKey: string): Promise<void> => {
  admin.firestore().collection("users").doc(publicKey).update({
    lastLogin: admin.firestore.Timestamp.now(),
  });
};

const validateInput = (publicKey: any, signature: any): void => {
  if (
    !publicKey ||
    typeof publicKey !== "string" ||
    !signature ||
    typeof signature !== "string"
  ) {
    logger.warn(INVALID_INPUT_ERROR.message);
    throw INVALID_INPUT_ERROR;
  }
};
