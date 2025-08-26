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
    <div className="h-full w-full rounded-lg bg-white shadow-soft ring-1 ring-gray-200 overflow-hidden">
      <div className="drag-handle flex items-center justify-between border-b border-gray-100 px-3 py-2 cursor-move select-none">
        <div className="text-sm font-medium text-gray-800 truncate">{title ?? `Widget ${id}`}</div>
        <button
          className="no-drag rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Remove widget"
          onClick={() => onClose(id)}
        >
          ×
        </button>
      </div>
      <div className="p-4 text-sm text-gray-600 space-y-3">
        {children ?? 'Placeholder'}
        {linkHref && (
          <div>
            <Link
              href={linkHref}
              className="no-drag inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
            >
              Open Full Page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
