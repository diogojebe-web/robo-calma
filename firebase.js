// Importe as funções necessárias do SDK do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Adicione a configuração do seu projeto Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyDPdU1LGr2khnY1vrBvaRgSVjB-JQ9jHJk",
  authDomain: "robo-calma.firebaseapp.com",
  projectId: "robo-calma",
  storageBucket: "robo-calma.firebasestorage.app",
  messagingSenderId: "691045761209",
  appId: "1:691045761209:web:34884b7a0cb4d51a189b68"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte o serviço de autenticação para ser usado em outras partes do app
export const auth = getAuth(app);