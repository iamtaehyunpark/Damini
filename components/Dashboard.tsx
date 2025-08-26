import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RGL, { Layout, WidthProvider } from 'react-grid-layout';
import Widget from './Widget';
import type { WidgetType } from './Header';
import { loadSessionId } from '@/lib/session';
import { getDashboardLayout, saveDashboardLayout, DashboardItem } from '@/lib/dashboard';
import { supabase } from '@/lib/supabaseClient';
import MemoWidget from './widgets/MemoWidget';

const GridLayout = WidthProvider(RGL);

type DashboardProps = {
  onRegisterAdd?: (handler: (type: WidgetType) => void) => void;
};

export default function Dashboard({ onRegisterAdd }: DashboardProps) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalChange, setIsLocalChange] = useState(false);

  // Load session ID and dashboard layout
  useEffect(() => {
    const loadDashboard = async () => {
      const currentSessionId = loadSessionId();
      if (!currentSessionId) {
        setLoading(false);
        return;
      }
      
      setSessionId(currentSessionId);
      
      try {
        const dashboardData = await getDashboardLayout(currentSessionId);
        if (dashboardData) {
          // Validate and clean the data
          const validItems = dashboardData.items.filter(item => 
            item && typeof item.id === 'string' && typeof item.type === 'string'
          );
          const validLayout = dashboardData.layout.filter(layout => 
            layout && typeof layout.i === 'string' && 
            typeof layout.x === 'number' && 
            typeof layout.y === 'number' && 
            typeof layout.w === 'number' && 
            typeof layout.h === 'number'
          );
          
          console.log('Loaded data:', { validItems, validLayout, nextId: dashboardData.nextId });
          setItems(validItems);
          setLayout(validLayout);
          setNextId(dashboardData.nextId);
        }
      } catch (error) {
        console.error('Failed to load dashboard layout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Set up real-time subscription for dashboard layout changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`dashboard-layout-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_layouts',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Don't update if this is a local change
          if (isLocalChange) return;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            setItems(newData.items || []);
            setLayout(newData.layout || []);
            setNextId(newData.next_id || 1);
          } else if (payload.eventType === 'DELETE') {
            setItems([]);
            setLayout([]);
            setNextId(1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isLocalChange]);

  // Save dashboard layout when it changes
  const saveLayout = useCallback(async () => {
    if (!sessionId) return;
    
    // Validate data before saving
    const validItems = items.filter(item => 
      item && typeof item.id === 'string' && typeof item.type === 'string'
    );
    const validLayout = layout.filter(layout => 
      layout && typeof layout.i === 'string' && 
      typeof layout.x === 'number' && 
      typeof layout.y === 'number' && 
      typeof layout.w === 'number' && 
      typeof layout.h === 'number'
    );
    
    console.log('Saving validated data:', { validItems, validLayout, nextId });
    
    try {
      setIsLocalChange(true);
      await saveDashboardLayout(sessionId, validItems, validLayout, nextId);
      // Reset the flag after a short delay to allow real-time updates from other users
      setTimeout(() => setIsLocalChange(false), 100);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
      setIsLocalChange(false);
    }
  }, [sessionId, items, layout, nextId]);

  // Debounced save to avoid too many database calls
  useEffect(() => {
    if (!sessionId) return;
    
    const timeoutId = setTimeout(saveLayout, 500);
    return () => clearTimeout(timeoutId);
  }, [saveLayout]);

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

    console.log('Adding widget:', { id, type, defaultPos });
    setItems((prev) => [...prev, { id, type }]);
    setLayout((prev) => [...prev, defaultPos]);
    setNextId((n) => n + 1);
  }, [items.length, nextId]);

  const removeWidget = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  // Expose add handler to parent (Header button)
  useEffect(() => {
    if (onRegisterAdd) onRegisterAdd(addWidget);
  }, [addWidget, onRegisterAdd]);

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    console.log('Layout changed:', newLayout);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

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
      layout={layout.filter(l => l && typeof l.h === 'number' && !isNaN(l.h))}
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
      {items.map((it) => {
        const layoutItem = layout.find((l) => l.i === it.id);
        // Only render if we have valid layout data
        if (!layoutItem || typeof layoutItem.h !== 'number' || isNaN(layoutItem.h)) {
          console.warn('Skipping widget with invalid layout:', it.id, layoutItem);
          return null;
        }
        
        return (
          <div key={it.id} data-grid={layoutItem}>
            <div className="h-full w-full">
              <Widget
                id={it.id}
                title={titleFor(it.type)}
                linkHref={hrefFor(it.type)}
                onClose={removeWidget}
              >
                {it.type === 'memo' && <MemoWidget />}
                {it.type === 'countdown' && (
                  <div className="text-xs text-gray-500">Countdown widget coming soon...</div>
                )}
                {it.type === 'letters' && (
                  <div className="text-xs text-gray-500">Letters widget coming soon...</div>
                )}
              </Widget>
            </div>
          </div>
        );
      })}
      </GridLayout>
    </div>
  );
}
