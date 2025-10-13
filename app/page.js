import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-4">
      <div className="text-center">
        
        {/* Adicionando a imagem do robô */}
        <Image 
          src="/robo-calma.png" // O caminho para a imagem na pasta public
          alt="Mascote do Robô C.A.L.M.A." // Texto alternativo para acessibilidade
          width={200} // Largura da imagem em pixels
          height={200} // Altura da imagem em pixels
          className="mx-auto mb-4" // Centraliza a imagem e adiciona uma margem abaixo
        />

        <h1 className="text-4xl font-bold text-blue-800">
          Robô C.A.L.M.A.
        </h1>
        <p className="mt-2 text-lg text-blue-600">
          Em breve, sua assistente de bem-estar.
        </p>

      </div>
    </main>
  )
}