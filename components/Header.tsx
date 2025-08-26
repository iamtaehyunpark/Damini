import React, { useEffect, useRef, useState } from 'react';

export type WidgetType = 'memo' | 'countdown' | 'letters';

type HeaderProps = {
  onAddWidget: (type: WidgetType) => void;
};

export default function Header({ onAddWidget }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const add = (type: WidgetType) => {
    onAddWidget(type);
    setOpen(false);
  };

  return (
    <header className="flex items-center justify-between relative">
      <div className="text-2xl font-semibold tracking-tight select-none">damin</div>
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50 active:bg-gray-100"
        >
          + Add Widget
        </button>
        {open && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-44 rounded-md bg-white py-1 text-sm shadow-soft ring-1 ring-gray-200 z-10"
          >
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('memo')}>Memo</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('countdown')}>Countdown</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('letters')}>Letters</button>
          </div>
        )}
      </div>
    </header>
  );
}
