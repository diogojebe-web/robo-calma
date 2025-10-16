"use client";

import { useEffect, useRef } from "react";

export default function ContextMenu({
  isOpen,
  x, // (não usamos mais, mas deixei na assinatura pra não quebrar)
  y, // (idem)
  onClose,
  onRename,
  onDelete,
  title,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // POSIÇÃO FIXA (sempre no centro-inferior)
  const PILL_BOTTOM = 180; // pílula acima do menu
  const MENU_BOTTOM = 110; // menu um pouco acima da borda inferior

  return (
    <>
      {/* Overlay com blur (fecha ao tocar) */}
      <div
  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
  onClick={(e) => {
    e.stopPropagation();
    onClose();
  }}
  onTouchStart={(e) => {
    e.stopPropagation();
    onClose();
  }}
/>


      {/* Pílula com o título da conversa */}
      <div
        className="fixed z-50 px-4 py-2 rounded-full bg-blue-100 text-blue-900 shadow"
        style={{ left: "50%", bottom: PILL_BOTTOM, transform: "translateX(-50%)" }}
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {title || "Nova Conversa..."}
        </span>
      </div>

      {/* Menu fixo, centralizado */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-gray-900 text-white rounded-xl shadow-xl p-2 w-44"
        style={{ left: "50%", bottom: MENU_BOTTOM, transform: "translateX(-50%)" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ul className="divide-y divide-gray-800">
          <li
            onClick={onRename}
            className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer"
          >
            <span>Renomear</span>
            <span>✏️</span>
          </li>
          <li
            onClick={onDelete}
            className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer text-red-400"
          >
            <span>Excluir</span>
            <span>🗑️</span>
          </li>
        </ul>
      </div>
    </>
  );
}
