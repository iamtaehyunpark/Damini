import { useEffect, useState } from 'react';
import { accessSession, createSession, loadSessionCode, saveSessionCode, saveSessionName, saveSessionId } from '@/lib/session';

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    // Client-side only
    const saved = loadSessionCode();
    if (saved) {
      setReady(true);
    }
  }, []);

  const onCreate = async () => {
    setWorking(true);
    setError('');
    try {
      const info = await createSession(name, code, password);
      saveSessionCode(info.sessionCode);
      saveSessionId(info.sessionId);
      if (info.sessionName) saveSessionName(info.sessionName);
      setReady(true);
    } catch (e: any) {
      setError(e?.message ?? '세션 생성에 실패했습니다.');
    } finally {
      setWorking(false);
    }
  };

  const [password, setPassword] = useState('');

  const onAccess = async () => {
    const c = code.trim();
    setWorking(true);
    setError('');
    try {
      const info = await accessSession(c, password);
      saveSessionCode(info.sessionCode);
      saveSessionId(info.sessionId);
      if (info.sessionName) saveSessionName(info.sessionName);
      setReady(true);
    } catch (e: any) {
      setError(e?.message ?? '세션 접속에 실패했습니다.');
    } finally {
      setWorking(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft ring-1 ring-gray-200">
          <h1 className="text-lg font-semibold">세션 시작</h1>
          <p className="mt-1 text-sm text-gray-600">세션 이름(선택), 세션 코드(문자열 해시), 비밀번호를 입력하세요.</p>
          <div className="mt-4 grid gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="세션 이름 (선택)"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              disabled={working}
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="세션 코드 (임의 문자열)"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              disabled={working}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="세션 비밀번호"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              disabled={working}
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={onCreate}
                disabled={working}
                className="flex-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {working ? '처리 중…' : '새 세션 생성'}
              </button>
              <button
                onClick={onAccess}
                disabled={working}
                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
              >
                기존 세션 접속
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
