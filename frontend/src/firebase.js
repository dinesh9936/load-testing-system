self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {

    apiKey: "AIzaSyDLeeDOrYHbAgifWeuXKDpMWprmG7JuWRM",

    authDomain: "mij-prepaid-meter-testing.firebaseapp.com",

    //databaseURL: "https://mij-prepaid-meter-testing-default-rtdb.firebaseio.com",

    projectId: "mij-prepaid-meter-testing",

    //storageBucket: "mij-prepaid-meter-testing.firebasestorage.app",

    //messagingSenderId: "1074346924944",

    appId: "1:1074346924944:web:3ecf83264e3ff79b2c3115",

    measurementId: "G-KW4YZX20M2"

};
const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6Ley-7ssAAAAAAqxB7_Aj7KR_JwknsslAYwH-uLD"),
    isTokenAutoRefreshEnabled: true,
});


export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");