"use client";

import { useEffect, useRef } from 'react';

export default function ContextMenu({ isOpen, x, y, onClose, onRename, onDelete, title }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // posiciona a “pílula” um pouco acima do menu
  const pillOffsetY = 58;

  return (
    <>
      {/* Overlay com blur para destacar o contexto (estilo iOS) */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Pílula com o título da conversa (preview) */}
      <div
        className="fixed z-50 px-4 py-2 rounded-full bg-blue-100 text-blue-900 shadow"
        style={{ left: x, top: Math.max(12, y - pillOffsetY), transform: "translateX(-50%)" }}
      >
        <span className="text-sm font-medium whitespace-nowrap">{title}</span>
      </div>

      {/* O menu em si */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-gray-900 text-white rounded-xl shadow-xl p-2 w-44"
        style={{ top: y, left: x, transform: "translateX(-50%)" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ul className="divide-y divide-gray-800">
          {/* Se quiser “Fixar” depois, dá pra ligar aqui. Por enquanto só visual. */}
          {/* <li className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer">
            <span>Fixar</span><span>📌</span>
          </li> */}
          <li onClick={onRename} className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer">
            <span>Renomear</span><span>✏️</span>
          </li>
          <li onClick={onDelete} className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer text-red-400">
            <span>Excluir</span><span>🗑️</span>
          </li>
        </ul>
      </div>
    </>
  );
}
