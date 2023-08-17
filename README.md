## Solana Authentication Guide

Before you start with this authentication template, make sure you've done the following:

### 1. Firestore Configuration
- Turn on Firestore in your Firebase project.

### 2. Anonymous Authentication
- Turn this on under `Authentication/Sign-in methods` in Firebase.

### 3. IAM Service Account Credentials
- You need to turn this on in your Firebase project.

### 4. AppEngine Permissions
- Assign the "Service Account Token Creator" role to the default compute service account. If you prefer to use 1st gen cloud functions, you should assign the "Service Account Token Creator" role to AppEngine. 

Note: In this demo, I used 2nd gen cloud functions. 

---

**Note**: This example uses Firestore. But if you want other database options, think about **PlanetScale** or **Supabase**. Firestore can get expensive and might be easy to misuse. When working on web3, it's essential to protect against misuse.

This demo will teach you about nonce signing, signature verification, how to handle authentication, and set up a custom wallet adapter. Just remember, this template isn't bulletproof on security, so be careful.

---
