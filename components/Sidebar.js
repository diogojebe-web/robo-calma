"use client";

// Adicionamos { isOpen, setIsOpen } para controlar a visibilidade no celular
export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    // ESTA É A MÁGICA: As classes controlam a posição em telas diferentes
    <div 
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white w-64 p-4 transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:relative md:translate-x-0`}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Botão de Nova Conversa */}
        <button className="flex-1 rounded-lg border border-gray-600 p-2 text-left text-sm hover:bg-gray-700">
          + Nova Conversa
        </button>

        {/* BOTÃO "X" PARA FECHAR (SÓ APARECE NO CELULAR) */}
        <button onClick={() => setIsOpen(false)} className="ml-2 p-1 text-white md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Área da Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-gray-400">Histórico de Conversas</p>
        <ul className="mt-2 space-y-2">
          <li className="cursor-pointer rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700">
            Conversa sobre ansiedade...
          </li>
          <li className="cursor-pointer rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700">
            Dicas para jejum...
          </li>
        </ul>
      </div>
    </div>
  );
}