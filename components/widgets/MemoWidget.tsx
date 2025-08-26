import { useState, useEffect } from 'react';
import { loadSessionId } from '@/lib/session';
import { getMemos, MemoRow } from '@/lib/memos';

type MemoWidgetMode = 'list' | 'search';

export default function MemoWidget() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [memos, setMemos] = useState<MemoRow[]>([]);
  const [mode, setMode] = useState<MemoWidgetMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<MemoRow | null>(null);
  const [searchResults, setSearchResults] = useState<MemoRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentSessionId = loadSessionId();
    if (currentSessionId) {
      setSessionId(currentSessionId);
      loadMemos(currentSessionId);
    }
  }, []);

  const loadMemos = async (sid: string) => {
    try {
      const memoList = await getMemos(sid);
      setMemos(memoList.slice(0, 5)); // Show only first 5 memos
    } catch (error) {
      console.error('Failed to load memos:', error);
    }
  };

  const handleSearch = async () => {
    if (!sessionId || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const allMemos = await getMemos(sessionId);
      const filtered = allMemos.filter(memo => 
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search memos:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectMemo = (memo: MemoRow) => {
    setSelectedMemo(memo);
    setMode('search');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mode selector */}
      <div className="mb-2">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as MemoWidgetMode);
            if (e.target.value === 'list') {
              setSelectedMemo(null);
              setSearchQuery('');
            }
          }}
          className="w-full text-xs px-2 py-1 border border-gray-200 rounded bg-white"
        >
          <option value="list">최신 메모 목록</option>
          <option value="search">특정 메모 검색</option>
        </select>
      </div>

      {mode === 'list' ? (
        /* List Mode - Show latest memos */
        <div className="flex-1 overflow-y-auto">
          {memos.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">메모가 없습니다</div>
          ) : (
            <div className="space-y-1">
              {memos.map((memo) => (
                <div key={memo.id} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => selectMemo(memo)}>
                  <div className="text-xs font-medium text-gray-800 truncate">{memo.title}</div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-1">{memo.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(memo.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Search Mode - Show specific memo */
        <div className="flex-1 flex flex-col">
          {!selectedMemo ? (
            /* Search interface */
            <div className="space-y-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="메모 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? '...' : '검색'}
                </button>
              </div>
              
              {/* Search results */}
              <div className="flex-1 overflow-y-auto">
                {searchResults.length === 0 && searchQuery && !loading ? (
                  <div className="text-xs text-gray-500 text-center py-2">검색 결과가 없습니다</div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((memo) => (
                      <div key={memo.id} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 cursor-pointer" onClick={() => selectMemo(memo)}>
                        <div className="text-xs font-medium text-gray-800 truncate">{memo.title}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-1">{memo.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Selected memo display */
            <div className="flex-1 flex flex-col">
              <div className="mb-2">
                <button
                  onClick={() => setSelectedMemo(null)}
                  className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  ← 뒤로
                </button>
              </div>
              <div className="flex-1 p-2 bg-white border border-gray-200 rounded overflow-y-auto">
                <div className="text-xs font-medium text-gray-800 mb-2">{selectedMemo.title}</div>
                <div className="text-xs text-gray-600 whitespace-pre-wrap">{selectedMemo.content}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(selectedMemo.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
