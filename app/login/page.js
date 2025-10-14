"use client"; // Isso transforma a página em um componente interativo no navegador

import Image from 'next/image';
import { useState } from 'react'; // Importamos o hook para "lembrar" o estado
import { useRouter } from 'next/navigation'; // Importamos o hook para redirecionar o usuário
import { signInWithEmailAndPassword } from 'firebase/auth'; // A função de login do Firebase
import { auth } from '../../firebase'; // Nossa configuração do Firebase que criamos

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // Impede que a página recarregue ao enviar o formulário
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login realizado com sucesso!");
      alert("Login bem-sucedido! Redirecionando...");
      router.push('/chat'); // Redireciona para a página de chat após o sucesso
    } catch (error) {
      console.error("Erro ao fazer login:", error.message);
      alert("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-sm">
        <Image 
          src="/robo-calma.png"
          alt="Mascote do Robô C.A.L.M.A."
          width={150}
          height={150}
          className="mx-auto mb-6"
        />

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Acesse sua conta
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2
           bg-white text-gray-900 placeholder-gray-500
           focus:outline-none focus:ring-2 focus:ring-blue-500"

                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2
           bg-white text-gray-900 placeholder-gray-500
           focus:outline-none focus:ring-2 focus:ring-blue-500"

                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-500">
          desenvolvido por @diogojebe com os princípios do Método C.A.L.M.A.
        </p>
      </div>
    </main>
  );
}