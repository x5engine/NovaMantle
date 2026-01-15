// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByiS0dt33wBKV-gcweTeuA0253Xzr3gr4",
  authDomain: "easyifu-af962.firebaseapp.com",
  databaseURL: "https://easyifu-af962-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "easyifu-af962",
  storageBucket: "easyifu-af962.appspot.com",
  messagingSenderId: "716707773169",
  appId: "1:716707773169:web:bfbb272b860b54e93a4750"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;