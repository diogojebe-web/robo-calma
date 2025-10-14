"use client";

import { useEffect, useRef } from 'react';

export default function ContextMenu({ isOpen, x, y, onClose, onRename, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
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

  return (
    <div
      ref={menuRef}
      className="absolute z-40 bg-gray-900 text-white rounded-md shadow-lg p-2 w-40"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()} // evita menu nativo
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
