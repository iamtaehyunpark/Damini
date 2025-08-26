import React from 'react';
import Link from 'next/link';

type WidgetProps = {
  id: string;
  onClose: (id: string) => void;
  title?: string;
  linkHref?: string;
  children?: React.ReactNode;
};

export default function Widget({ id, onClose, title, linkHref, children }: WidgetProps) {
  return (
    <div className="h-full w-full rounded-lg bg-white shadow-soft ring-1 ring-gray-200 overflow-hidden flex flex-col">
      {/* Shorter header */}
      <div className="drag-handle flex items-center justify-between border-b border-gray-100 px-3 py-0.2 cursor-move select-none bg-gray-50">
        <div className="text-xs font-medium text-gray-700 truncate">{title ?? `Widget ${id}`}</div>
        <button
          className="no-drag rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 text-sm"
          aria-label="Remove widget"
          onClick={() => onClose(id)}
        >
          ×
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 p-2 text-xs text-gray-600 overflow-hidden">
        {children ?? 'Placeholder'}
      </div>
      
      {/* Footer with link */}
      {linkHref && (
        <div className="px-2 py-1.5">
        {/*<div className="border-t border-gray-100 px-2 py-1.5 bg-gray-50">*/}
          <Link
            href={linkHref}
            className="no-drag inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            //className="no-drag inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100 hover:text-gray-800"
          >
            더보기
          </Link>
        </div>
      )}
    </div>
  );
}
