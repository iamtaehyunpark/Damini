import { supabase } from '@/lib/supabaseClient';
import { Layout } from 'react-grid-layout';

export type DashboardItem = {
  id: string;
  type: 'memo' | 'countdown' | 'letters';
};

export type DashboardLayout = {
  sessionId: string;
  items: DashboardItem[];
  layout: Layout[];
  nextId: number;
};

export async function getDashboardLayout(sessionId: string): Promise<DashboardLayout | null> {
  console.log('Loading dashboard layout for session:', sessionId);
  
  const { data, error } = await supabase
    .from('dashboard_layouts')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  
  if (error) {
    console.error('Error loading dashboard layout:', error);
    throw error;
  }
  
  if (!data) {
    console.log('No dashboard layout found for session:', sessionId);
    return null;
  }
  
  const result = {
    sessionId: data.session_id,
    items: data.items || [],
    layout: data.layout || [],
    nextId: data.next_id || 1,
  };
  
  console.log('Loaded dashboard layout:', result);
  return result;
}

export async function saveDashboardLayout(sessionId: string, items: DashboardItem[], layout: Layout[], nextId: number): Promise<void> {
  console.log('Saving dashboard layout:', { sessionId, items, layout, nextId });
  
  try {
    // First try to update existing record
    const { data: existing, error: selectError } = await supabase
      .from('dashboard_layouts')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (selectError) {
      console.error('Error checking existing record:', selectError);
      throw selectError;
    }
    
    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('dashboard_layouts')
        .update({
          items,
          layout,
          next_id: nextId,
        })
        .eq('session_id', sessionId);
      
      if (updateError) {
        console.error('Error updating dashboard layout:', updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('dashboard_layouts')
        .insert({
          session_id: sessionId,
          items,
          layout,
          next_id: nextId,
        });
      
      if (insertError) {
        console.error('Error inserting dashboard layout:', insertError);
        throw insertError;
      }
    }
    
    console.log('Dashboard layout saved successfully');
  } catch (error) {
    console.error('Error in saveDashboardLayout:', error);
    throw error;
  }
}

export async function deleteDashboardLayout(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('dashboard_layouts')
    .delete()
    .eq('session_id', sessionId);
  
  if (error) throw error;
}

// Clear dashboard layout from localStorage (for session switching)
export function clearDashboardLocalStorage() {
  try {
    // Clear any old localStorage keys that might exist
    localStorage.removeItem('damin_widgets_items');
    localStorage.removeItem('damin_widgets_layout');
    localStorage.removeItem('damin_widgets_next_id');
  } catch {}
}
