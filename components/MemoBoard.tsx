import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadSessionCode, loadSessionId } from '@/lib/session';
import { addMemo, deleteMemo, getMemos, MemoRow, updateMemo } from '@/lib/memos';

export default function MemoBoard() {
  const [sessionCode, setSessionCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memos, setMemos] = useState<MemoRow[]>([]);
  const [editing, setEditing] = useState<MemoRow | null>(null);
  const [query, setQuery] = useState('');

  // Restore session from localStorage
  useEffect(() => {
    const savedCode = loadSessionCode();
    const savedId = loadSessionId();
    if (savedCode) setSessionCode(savedCode);
    if (savedId) {
      setSessionId(savedId);
      // Load memos for session
      (async () => {
        try {
          const list = await getMemos(savedId);
          setMemos(list);
        } catch (e: any) {
          setError(e?.message ?? '세션 로드에 실패했습니다.');
        }
      })();
    }
  }, []);

  // All session gating is handled globally in pages/_app.tsx via <SessionGate />

  // Creation of sessions is handled by SessionGate; no in-board creation.

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return memos;
    return memos.filter(
      (m) => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
    );
  }, [memos, query]);

  const onAdd = async () => {
    if (!sessionId) return;
    const t = title.trim();
    const c = content.trim();
    if (!t && !c) return;
    setLoading(true);
    try {
      const created = await addMemo(sessionId, t || '제목 없음', c);
      setMemos((prev) => [created, ...prev]);
      setTitle('');
      setContent('');
    } catch (e: any) {
      setError(e?.message ?? '메모 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    setLoading(true);
    try {
      await deleteMemo(id);
      setMemos((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      setError(e?.message ?? '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSaveEdit = async (id: string, t: string, c: string) => {
    setLoading(true);
    try {
      const updated = await updateMemo(id, t.trim() || '제목 없음', c);
      setMemos((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditing(null);
    } catch (e: any) {
      setError(e?.message ?? '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">메모</h1>
          <Link href="/" className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50">대시보드로</Link>
        </div>

        {/* Session is globally gated; when no session, outer gate prevents rendering */}

        {/* Create form */}
        <div className="mt-6 grid gap-3 rounded-lg bg-white p-4 shadow-soft ring-1 ring-gray-200">
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!sessionId}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100"
          />
          <textarea
            placeholder="메모 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={!sessionId}
            className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">Supabase에 저장됩니다.</div>
            <button
              onClick={onAdd}
              disabled={!sessionId || loading}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-soft hover:bg-gray-800 disabled:opacity-60"
            >
              추가
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="검색 ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessionId && filtered.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">메모가 없습니다.</div>
          )}
          {filtered.map((m) => (
            <article key={m.id} className="flex flex-col rounded-lg bg-white p-4 shadow-soft ring-1 ring-gray-200">
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-semibold text-gray-800 truncate pr-2">{m.title}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(m)} className="rounded px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">수정</button>
                  <button onClick={() => onDelete(m.id)} className="rounded px-2 py-1 text-xs text-red-600 ring-1 ring-red-200 hover:bg-red-50">삭제</button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{m.content || '—'}</p>
              <div className="mt-3 text-xs text-gray-400">업데이트: {new Date(m.updated_at).toLocaleString()}</div>
            </article>
          ))}
        </div>
      </div>

      {editing && (
        <EditModal
          memo={editing}
          onCancel={() => setEditing(null)}
          onSave={(t, c) => onSaveEdit(editing.id, t, c)}
        />
      )}
    </main>
  );
}

function EditModal({ memo, onCancel, onSave }: { memo: MemoRow; onCancel: () => void; onSave: (title: string, content: string) => void; }) {
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-soft ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900">메모 수정</h3>
        <div className="mt-4 grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">취소</button>
          <button onClick={() => onSave(title, content)} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">저장</button>
        </div>
      </div>
    </div>
  );
}
