import { useState, useCallback, useEffect } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";

import { PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import {
  User,
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
} from "firebase/auth";
import { auth, functions } from "../lib/firebase";

async function getNonceForPublicKey(publicKey: PublicKey) {
  if (!publicKey) throw new Error("Wallet not connected!");

  try {
    const getNonceCallable = httpsCallable(functions, "getNonce");
    return await getNonceCallable({ publicKey: publicKey.toBase58() }).then(
      (result) => {
        const data = result.data as { nonce: string };
        return data.nonce;
      }
    );
  } catch (error) {
    console.error("Error getting nonce:", error);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const authenticate = useCallback(async (wallet: WalletContextState) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected!");
    if (!wallet.signMessage)
      throw new Error("Wallet does not support message signing!");

    const nonce = await getNonceForPublicKey(wallet.publicKey);

    if (!nonce) throw new Error("Could not get nonce");

    const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
    const encodedMessage = new TextEncoder().encode(message);

    const signature = await wallet
      .signMessage(encodedMessage)
      .then((result) => bs58.encode(result));

    setAuthenticating(true);
    const functions = getFunctions();
    const verify = httpsCallable(functions, "authenticate");
    await verify({
      publicKey: wallet.publicKey.toBase58(),
      signature: signature,
    })
      .then(async (result) => {
        const data = result.data as { token: string };
        setPersistence(auth, browserSessionPersistence);
        await signInWithCustomToken(auth, data.token)
          .then((cred) => {
            setUser(cred.user);
          })
          .catch((err) => {
            if (err.code === "auth/user-disabled") {
              throw new Error(
                "It looks like this wallet is banned. If you think this is a mistake contact us in Discord."
              );
            } else {
              throw new Error(
                "Something went wrong. Close browser and try again. Contact us in Discord if issue persists."
              );
            }
          });
      })
      .finally(() => setAuthenticating(false));
  }, []);

  return {
    authenticate,
    authenticating,
    user,
  };
}
