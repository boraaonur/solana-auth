import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();

// Set the maximum instances to 10 for all functions
setGlobalOptions({ maxInstances: 10 });

export { getNonce } from "./get-nonce";
export { authenticate } from "./authenticate";
