import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { limiter } from "./utils/limiter";
import { isValidPublicKey } from "./utils/validation";
import { INVALID_PUBLIC_KEY_ERROR } from "./utils/errors";

var crypto = require("crypto");

export const getNonce = onCall(async (ctx) => {
  /*  
    validateContextApp(ctx);
    -> I intentionally disabled this since this is a portfolio demo but normally you should use this in prod
  */

  await limiter.rejectOnQuotaExceededOrRecordUsage();

  try {
    const { publicKey } = ctx.data;

    if (!isValidPublicKey(publicKey)) {
      logger.warn(INVALID_PUBLIC_KEY_ERROR.message);
      throw INVALID_PUBLIC_KEY_ERROR;
    }

    await ensureUserExists(publicKey);

    const nonce = await getOrCreateNonce(publicKey);
    return { nonce };
  } catch (err: any) {
    logger.error(err);
    throw new HttpsError("unknown", err.message || "An error occurred");
  }
});

const getOrCreateNonce = async (publicKey: string): Promise<string> => {
  const userNonceDocRef = admin.firestore().collection("nonces").doc(publicKey);
  const userNonceDoc = await userNonceDocRef.get();

  if (userNonceDoc.exists) {
    return userNonceDoc.data()!.nonce;
  } else {
    const nonce = crypto.randomBytes(32).toString("base64");
    await userNonceDocRef.create({ nonce: nonce });
    return nonce;
  }
};

const ensureUserExists = async (publicKey: string) => {
  const uidExists = await admin
    .auth()
    .getUser(publicKey)
    .then(() => true)
    .catch(() => false);
  if (!uidExists) {
    await admin.auth().createUser({ uid: publicKey });
    await admin.firestore().collection("users").doc(publicKey).create({
      username: null,
      lastLogin: null,
    });
  }
};
