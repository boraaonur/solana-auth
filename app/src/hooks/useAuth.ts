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
  AuthError,
} from "firebase/auth";
import { auth, functions } from "../lib/firebase";
import {
  ERR_WALLET_NOT_CONNECTED,
  ERR_WALLET_NOT_SUPPORT_SIGNING,
  ERR_NONCE_MISSING,
  ERR_WALLET_BANNED,
  ERR_GENERIC,
} from "../constants/errors";

async function getNonceForPublicKey(publicKey: PublicKey) {
  if (!publicKey) throw new Error(ERR_WALLET_NOT_CONNECTED);

  const getNonceCallable = httpsCallable(functions, "getNonce");
  try {
    const result = await getNonceCallable({ publicKey: publicKey.toBase58() });
    const data = result.data as { nonce: string };
    return data.nonce;
  } catch (error) {
    console.error("Error getting nonce:", error);
    return null;
  }
}

async function attemptAuthentication(
  wallet: WalletContextState,
  nonce: string
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected!");
  if (!wallet.signMessage)
    throw new Error("Wallet does not support message signing!");

  const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
  const encodedMessage = new TextEncoder().encode(message);
  const signature = bs58.encode(await wallet.signMessage(encodedMessage));
  const verify = httpsCallable(getFunctions(), "authenticate");

  const result = await verify({
    publicKey: wallet.publicKey.toBase58(),
    signature: signature,
  });

  const data = result.data as { token: string };

  await setPersistence(auth, browserSessionPersistence);
  const credentials = await signInWithCustomToken(auth, data.token);
  return credentials.user;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const authenticate = useCallback(async (wallet: WalletContextState) => {
    if (!wallet.publicKey) throw new Error(ERR_WALLET_NOT_CONNECTED);
    if (!wallet.signMessage) throw new Error(ERR_WALLET_NOT_SUPPORT_SIGNING);

    const nonce = await getNonceForPublicKey(wallet.publicKey);

    if (!nonce) throw new Error(ERR_NONCE_MISSING);

    setAuthenticating(true);

    try {
      const authenticatedUser = await attemptAuthentication(wallet, nonce);
      setUser(authenticatedUser);
    } catch (err) {
      if ((err as AuthError).code === "auth/user-disabled") {
        throw new Error(ERR_WALLET_BANNED);
      } else {
        throw new Error(ERR_GENERIC);
      }
    } finally {
      setAuthenticating(false);
    }
  }, []);

  return {
    authenticate,
    authenticating,
    user,
  };
}
