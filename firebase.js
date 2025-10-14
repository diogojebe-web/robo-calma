// Importe as funções necessárias do SDK do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importamos o Firestore

// A configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPdU1LGr2khnY1vrBvaRgSVjB-JQ9jHJk",
  authDomain: "robo-calma.firebaseapp.com",
  projectId: "robo-calma",
  storageBucket: "robo-calma.firebasestorage.app",
  messagingSenderId: "691045761209",
  appId: "1:691045761209:web:34884b7a0cb4d51a189b68"
};

// ATENÇÃO: Cole aqui o seu bloco firebaseConfig, substituindo o de exemplo acima.

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte os serviços que vamos usar no aplicativo
export const auth = getAuth(app);
export const db = getFirestore(app); // Exportamos a conexão com o banco de dados