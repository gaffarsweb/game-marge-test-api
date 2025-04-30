
import  admin from "firebase-admin";

  
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), 
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    token_uri: process.env.FIREBASE_TOKEN_URI,
};

export default admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
