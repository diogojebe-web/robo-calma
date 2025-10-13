import Image from 'next/image';

export default function LoginPage() {
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
          
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input 
                type="email" 
                id="email" 
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input 
                type="password" 
                id="password" 
                name="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
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