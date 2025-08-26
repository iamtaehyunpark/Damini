import { supabase } from '@/lib/supabaseClient';

export type MemoRow = {
  id: string;
  session_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function getMemos(sessionId: string): Promise<MemoRow[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('id, session_id, title, content, created_at, updated_at')
    .eq('session_id', sessionId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addMemo(sessionId: string, title: string, content: string): Promise<MemoRow> {
  const { data, error } = await supabase
    .from('memos')
    .insert({ session_id: sessionId, title, content })
    .select('id, session_id, title, content, created_at, updated_at')
    .single();
  if (error) throw error;
  return data!;
}

export async function updateMemo(memoId: string, title: string, content: string): Promise<MemoRow> {
  const { data, error } = await supabase
    .from('memos')
    .update({ title, content })
    .eq('id', memoId)
    .select('id, session_id, title, content, created_at, updated_at')
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteMemo(memoId: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', memoId);
  if (error) throw error;
}
