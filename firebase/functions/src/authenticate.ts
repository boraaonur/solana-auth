import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";
import verifySignature from "./utils/verify-signature";
import { limiter } from "./utils/limiter";

var crypto = require("crypto");

export const authenticate = onCall(async (ctx) => {
  /* 
  I intentionally disabled this since this is a portfolio demo but normally you should use this

  if (ctx.app == undefined) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app."
    );
  }
  */

  await limiter.rejectOnQuotaExceededOrRecordUsage(); // will throw HttpsException with proper warning

  try {
    const { publicKey, signature } = ctx.data;

    if (!signature || !publicKey) {
      console.log("Body does not contain signature of public key");
      throw new HttpsError("unknown", "publicKey is empty or null");
    }

    if (typeof publicKey !== "string" || typeof signature !== "string") {
      console.log("PubKey is not string.");
      throw new HttpsError("unknown", "publicKey is empty or null");
    }

    // bunlar bize string olarak gelecek
    console.log(publicKey);
    console.log(signature);
    logger.log("");
    console.log(
      "Checking signature: " + signature + " of address: " + publicKey
    );
    // Get user document with publicKey (uid)
    const userDocRef = admin.firestore().collection("nonces").doc(publicKey);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      // Get nonce
      const nonce = userDoc.data()!["nonce"];

      // Sign verify
      console.log(nonce);
      console.log(publicKey);
      console.log(signature);
      const verified = await verifySignature(nonce, publicKey, signature);
      console.log("VERIFIED STATUS FOR VERIFYSIGNATURE IS: " + verified);
      if (verified) {
        //// Update nonce to prevent "replay?" attacks
        const newNonce = crypto.randomBytes(32).toString("base64");
        await userDocRef.set({ nonce: newNonce });

        // Send user login token
        const firebaseToken = await admin.auth().createCustomToken(publicKey);

        // Update last login
        admin
          .firestore()
          .collection("users")
          .doc(publicKey)
          .update({ lastLogin: admin.firestore.Timestamp.now() });

        return { error: null, token: firebaseToken };
      } else {
        console.log(`Signature of ` + publicKey + " could not be verified");
        throw new HttpsError("unknown", "publicKey is empty or null");
      }
    } else {
      console.log("User document of " + publicKey + " does not exist");
      throw new HttpsError("unknown", "publicKey is empty or null");
    }
  } catch (err) {
    console.log(err);
    throw new HttpsError("unknown", "Something went wrong.");
  }
});
