import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyDFdeRntHMB3Mcq7e11tB6ziui9HoAApWk",
  authDomain: "slack-chat-app-4c9fc.firebaseapp.com",
  projectId: "slack-chat-app-4c9fc",
  storageBucket: "slack-chat-app-4c9fc.appspot.com",
  messagingSenderId: "765430669795",
  appId: "1:765430669795:web:af1445098a3a02a15900d6",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
