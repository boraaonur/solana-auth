import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";
import { limiter } from "./utils/limiter";

var crypto = require("crypto");
var WAValidator = require("multicoin-address-validator");

export const getNonce = onCall(async (ctx) => {
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
    const { publicKey } = ctx.data;
    logger.log(ctx.data);
    if (!publicKey) {
      throw new HttpsError("unknown", "publicKey is empty or null");
    }

    if (typeof publicKey !== "string") {
      throw new HttpsError("unknown", "publicKey is not string");
    }

    var valid = WAValidator.validate(publicKey, "sol");

    if (!valid) {
      console.log("Provided UID/PublicKey is not valid for Solana");
      throw new HttpsError(
        "unknown",
        "Provided UID/PublicKey is not valid for Solana"
      );
    }

    console.log("Provided PubKey: " + publicKey + " is valid");

    // Get user document for pubKey
    const userNonceDocRef = admin
      .firestore()
      .collection("nonces")
      .doc(publicKey);
    const userNonceDoc = await userNonceDocRef.get();

    if (userNonceDoc.exists) {
      // User nonce document already exists, so return nonce
      const data = userNonceDoc.data();
      const existingNonce = data!["nonce"];
      return { nonce: existingNonce };
    } else {
      // User nonce document does not exist, create a nonce
      const nonce = crypto.randomBytes(32).toString("base64");
      console.log("Creating nonce for first time: " + nonce);
      logger.log("");
      // Create an Auth user (TRANSACTION OLMALI)
      const uidExists = await admin
        .auth()
        .getUser(publicKey)
        .then(() => true)
        .catch(() => false);

      if (uidExists) {
        // do nothing?
      } else {
        await admin
          .auth()
          .createUser({ uid: publicKey })
          .then(async (user) => {
            console.log("User created with ID: " + publicKey);
          })
          .catch((error) => {
            console.log(error);
          });
      }

      // Create user document
      await admin.firestore().collection("users").doc(publicKey).create({
        username: null,
        lastLogin: null,
      });

      // Associate the nonce with that user
      await userNonceDocRef.create({ nonce: nonce });
      return { nonce: nonce };
    }
  } catch (err) {
    console.log(err);
    throw new HttpsError("unknown", "publicKey is empty or null");
  }
});
