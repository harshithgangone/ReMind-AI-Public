import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import admin from "firebase-admin"
import dotenv from "dotenv"

dotenv.config()

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}

// Create a singleton pattern for Firebase Admin
let firebaseAdmin = null

export const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    firebaseAdmin = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      "remind-ai-app",
    )
  }
  return firebaseAdmin
}

const auth = getAuth(getFirebaseAdmin())
const db = getFirestore(getFirebaseAdmin())

export { auth, db }

