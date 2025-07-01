
const firebaseConfig = {
  apiKey: "AIzaSyAzqVgkHTxeL6AsM4n_CazGCxiDJhxCXD8",
  authDomain: "bambozo-secure.firebaseapp.com",
  projectId: "bambozo-secure",
  storageBucket: "bambozo-secure.appspot.com",
  messagingSenderId: "282208402307",
  appId: "1:282208402307:web:6b8610ac92dbf545be53d2",
  measurementId: "G-R5FRQQCEW9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
