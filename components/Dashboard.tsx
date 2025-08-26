import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RGL, { Layout, WidthProvider } from 'react-grid-layout';
import Widget from './Widget';
import type { WidgetType } from './Header';

const GridLayout = WidthProvider(RGL);

const STORAGE_KEYS = {
  items: 'damin_widgets_items',
  layout: 'damin_widgets_layout',
  nextId: 'damin_widgets_next_id',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

type DashboardProps = {
  onRegisterAdd?: (handler: (type: WidgetType) => void) => void;
};

type Item = { i: string; type: WidgetType };

export default function Dashboard({ onRegisterAdd }: DashboardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [nextId, setNextId] = useState<number>(1);

  // Load persisted state
  useEffect(() => {
    const loadedItems = loadFromStorage<Item[]>(STORAGE_KEYS.items, []);
    const loadedLayout = loadFromStorage<Layout[]>(STORAGE_KEYS.layout, []);
    const loadedNextId = loadFromStorage<number>(STORAGE_KEYS.nextId, 1);
    setItems(loadedItems);
    setLayout(loadedLayout);
    setNextId(loadedNextId);
  }, []);

  // Persist on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.items, items);
  }, [items]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.layout, layout);
  }, [layout]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.nextId, nextId);
  }, [nextId]);

  const addWidget = useCallback((type: WidgetType) => {
    const id = String(nextId);
    const defaultPos = {
      i: id,
      x: (items.length * 2) % 12,
      y: Infinity, // put at bottom
      w: 3,
      h: 5,
      minW: 2,
      minH: 3,
    } as Layout;

    setItems((prev) => [...prev, { i: id, type }]);
    setLayout((prev) => [...prev, defaultPos]);
    setNextId((n) => n + 1);
  }, [items.length, nextId]);

  const removeWidget = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.i !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  // Expose add handler to parent (Header button)
  useEffect(() => {
    if (onRegisterAdd) onRegisterAdd(addWidget);
  }, [addWidget, onRegisterAdd]);

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
  }, []);

  const titleFor = (type: WidgetType) => {
    switch (type) {
      case 'memo':
        return 'Memo Preview';
      case 'countdown':
        return 'Countdown Preview';
      case 'letters':
        return 'Letters Preview';
    }
  };

  const hrefFor = (type: WidgetType) => {
    switch (type) {
      case 'memo':
        return '/memo';
      case 'countdown':
        return '/countdown';
      case 'letters':
        return '/letters';
    }
  };

  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="relative">
      {/* Grid overlay: shows during drag/resize across the whole canvas, does not capture pointer events */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          opacity: showGrid ? 0.35 : 0,
          backgroundImage: `
            repeating-linear-gradient(
              to right,
              rgba(0,0,0,0.08) 0,
              rgba(0,0,0,0.08) 1px,
              transparent 1px,
              transparent calc(100% / 12)
            ),
            repeating-linear-gradient(
              to bottom,
              rgba(0,0,0,0.06) 0,
              rgba(0,0,0,0.06) 1px,
              transparent 1px,
              transparent 80px
            )
          `,
          backgroundSize: 'calc(100% / 12) 100%, 100% 80px',
          backgroundPosition: '0 0, 0 0',
        }}
      />

      <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={80}
      width={1200}
      // width is controlled by WidthProvider, but we still set a hint
      margin={[12, 12]}
      containerPadding={[0, 0]}
      onLayoutChange={onLayoutChange}
      onDragStart={() => setShowGrid(true)}
      onResizeStart={() => setShowGrid(true)}
      onResizeStop={(l) => {
        onLayoutChange(l);
        setShowGrid(false);
      }}
      onDrag={(_l) => {
        if (!showGrid) setShowGrid(true);
      }}
      onDragStop={(l) => {
        onLayoutChange(l);
        setShowGrid(false);
      }}
      draggableHandle=".drag-handle"
      draggableCancel=".no-drag"
      resizeHandles={['se']}
      compactType={null}
      isBounded={false}
      preventCollision //this prevent widgets from overlapping. Collision widget will automatically move toward down when this line deleted.
    >
      {items.map((it) => (
        <div key={it.i} data-grid={layout.find((l) => l.i === it.i)}>
          <div className="h-full w-full">
            <Widget
              id={it.i}
              title={titleFor(it.type)}
              linkHref={hrefFor(it.type)}
              onClose={removeWidget}
            >
              <div className="mt-2">Widget {it.i} • {it.type}</div>
              <div className="text-xs text-gray-400">
                {(() => {
                  const l = layout.find((l) => l.i === it.i);
                  return l ? `size ${l.w}×${l.h} • start (${l.x},${l.y})` : '';
                })()}
              </div>
            </Widget>
          </div>
        </div>
      ))}
      </GridLayout>
    </div>
  );
}
