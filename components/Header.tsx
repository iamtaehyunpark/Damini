import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { clearSessionStorage, loadSessionName } from '@/lib/session';

export type WidgetType = 'memo' | 'countdown' | 'letters';

type HeaderProps = {
  onAddWidget: (type: WidgetType) => void;
};

export default function Header({ onAddWidget }: HeaderProps) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openPage, setOpenPage] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const pageBtnRef = useRef<HTMLButtonElement | null>(null);
  const pageMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideAdd = addMenuRef.current?.contains(target) || addBtnRef.current?.contains(target);
      const insidePage = pageMenuRef.current?.contains(target) || pageBtnRef.current?.contains(target);
      if (insideAdd || insidePage) return;
      if (openAdd) setOpenAdd(false);
      if (openPage) setOpenPage(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [openAdd, openPage]);

  const add = (type: WidgetType) => {
    onAddWidget(type);
    setOpenAdd(false);
  };

  return (
    <header className="flex items-center justify-between relative">
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-bold tracking-tight select-none">Damin</div>
        <div className="text-xl font-semibold text-black truncate max-w-[260px]" title={loadSessionName() || ''}>
          {loadSessionName() || '—'}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Back to SessionGate button */}
        <button
          onClick={() => {
            clearSessionStorage();
            if (typeof window !== 'undefined') window.location.reload();
          }}
          className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50"
        >
          세션 변경
        </button>

        {/* Open Page menu */}
        <div className="relative">
          <button
            ref={pageBtnRef}
            type="button"
            onClick={() => {
              setOpenPage((v) => !v);
              if (openAdd) setOpenAdd(false);
            }}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50 active:bg-gray-100"
          >
            Open Page
          </button>
          {openPage && (
            <div
              ref={pageMenuRef}
              className="absolute right-0 mt-2 w-44 rounded-md bg-white py-1 text-sm shadow-soft ring-1 ring-gray-200 z-10"
            >
              <Link href="/memo" className="block px-3 py-2 hover:bg-gray-50">Memo</Link>
              <Link href="/countdown" className="block px-3 py-2 hover:bg-gray-50">Countdown</Link>
              <Link href="/letters" className="block px-3 py-2 hover:bg-gray-50">Letters</Link>
            </div>
          )}
        </div>

        {/* Add Widget menu */}
        <div className="relative">
          <button
            ref={addBtnRef}
            type="button"
            onClick={() => {
              setOpenAdd((v) => !v);
              if (openPage) setOpenPage(false);
            }}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50 active:bg-gray-100"
          >
            + Add Widget
          </button>
          {openAdd && (
            <div
              ref={addMenuRef}
              className="absolute right-0 mt-2 w-44 rounded-md bg-white py-1 text-sm shadow-soft ring-1 ring-gray-200 z-10"
            >
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('memo')}>Memo</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('countdown')}>Countdown</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => add('letters')}>Letters</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
