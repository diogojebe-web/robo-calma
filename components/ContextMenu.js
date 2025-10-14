"use client";

import { useEffect, useRef } from 'react';

// Este é o nosso menu flutuante
export default function ContextMenu({ isOpen, x, y, onClose, onRename, onDelete }) {
  const menuRef = useRef(null);

  // Efeito para fechar o menu se o usuário clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-40 bg-gray-900 text-white rounded-md shadow-lg p-2 w-40"
      style={{ top: y, left: x }}
    >
      <ul>
        <li onClick={onRename} className="p-2 text-sm rounded-md hover:bg-gray-700 cursor-pointer">
          Renomear
        </li>
        <li onClick={onDelete} className="p-2 text-sm text-red-500 rounded-md hover:bg-gray-700 cursor-pointer">
          Excluir
        </li>
      </ul>
    </div>
  );
}