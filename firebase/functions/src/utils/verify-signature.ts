import { sign } from "tweetnacl";
const bs58 = require("bs58");

async function verifySignature(
  nonce: string,
  publicKey: any,
  signature: any
): Promise<boolean> {
  // Sign verify
  const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
  const messageBytes = new TextEncoder().encode(message);

  const publicKeyBytes = bs58.decode(publicKey);
  const signatureBytes = bs58.decode(signature);

  return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
}

export default verifySignature;
