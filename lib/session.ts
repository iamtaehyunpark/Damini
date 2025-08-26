import { supabase } from '@/lib/supabaseClient';

export type SessionInfo = {
  sessionId: string;
  sessionCode: string;
  sessionName?: string;
};

const SESSION_CODE_KEY = 'damin_session_code';
const SESSION_ID_KEY = 'damin_session_id';
const SESSION_NAME_KEY = 'damin_session_name';

export function saveSessionCode(code: string) {
  try {
    localStorage.setItem(SESSION_CODE_KEY, code);
  } catch {}
}

export function loadSessionCode(): string | null {
  try {
    return localStorage.getItem(SESSION_CODE_KEY);
  } catch {
    return null;
  }
}

export function saveSessionId(id: string) {
  try {
    localStorage.setItem(SESSION_ID_KEY, id);
  } catch {}
}

export function loadSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function saveSessionName(name: string) {
  try {
    localStorage.setItem(SESSION_NAME_KEY, name);
  } catch {}
}

export function loadSessionName(): string | null {
  try {
    return localStorage.getItem(SESSION_NAME_KEY);
  } catch {
    return null;
  }
}

export function clearSessionStorage() {
  try {
    localStorage.removeItem(SESSION_CODE_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
  } catch {}
}

// Hash arbitrary string into short alphanumeric session code (6-8 chars)
async function hashToCode(input: string, length: number = 8): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  // base36 then slice
  const base36 = BigInt('0x' + hex).toString(36);
  return base36.slice(0, Math.min(Math.max(6, length), 12)).toLowerCase();
}

async function hashToHex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// (legacy create/join helpers removed)

export async function accessSession(codeInput: string, password: string): Promise<SessionInfo> {
  const rawCode = (codeInput || '').trim();
  const rawPw = (password || '').trim();
  if (!rawCode || !rawPw) throw new Error('세션 코드와 비밀번호를 입력하세요.');
  // Accept either already-hashed code (alphanumeric) or arbitrary string to hash
  const code = /^[a-z0-9]{6,12}$/i.test(rawCode) ? rawCode.toLowerCase() : await hashToCode(rawCode, 8);
  const pwHash = await hashToHex(rawPw);
  const { data, error } = await supabase
    .from('sessions')
    .select('id, session_code, session_name, session_password')
    .eq('session_code', code)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('세션을 찾을 수 없습니다.');
  if ((data as any).session_password !== pwHash) throw new Error('비밀번호가 올바르지 않습니다.');
  return { sessionId: data.id, sessionCode: (data as any).session_code, sessionName: (data as any).session_name };
}

export async function createSession(name: string, codeInput: string, password: string): Promise<SessionInfo> {
  const rawName = (name || '').trim();
  const rawCode = (codeInput || '').trim();
  const rawPw = (password || '').trim();
  if (!rawCode || !rawPw) throw new Error('세션 코드와 비밀번호를 입력하세요.');
  const code = /^[a-z0-9]{6,12}$/i.test(rawCode) ? rawCode.toLowerCase() : await hashToCode(rawCode, 8);
  const pwHash = await hashToHex(rawPw);

  // Enforce unique session_code
  const { data: existing, error: selErr } = await supabase
    .from('sessions')
    .select('id')
    .eq('session_code', code)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) throw new Error('이미 존재하는 세션 코드입니다. 다른 코드를 사용하세요.');

  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_name: rawName || null, session_code: code, session_password: pwHash })
    .select('id, session_code, session_name')
    .single();
  if (error) throw error;
  return { sessionId: data.id, sessionCode: (data as any).session_code, sessionName: (data as any).session_name };
}
