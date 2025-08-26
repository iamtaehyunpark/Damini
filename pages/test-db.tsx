import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { loadSessionId } from '@/lib/session';

export default function TestDB() {
  const [status, setStatus] = useState<string>('Testing...');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        setStatus('Testing Supabase connection...');
        const { data, error } = await supabase.from('sessions').select('count').limit(1);
        if (error) throw error;
        setStatus('Supabase connection: OK');

        // Test dashboard_layouts table
        setStatus('Testing dashboard_layouts table...');
        const { data: layoutData, error: layoutError } = await supabase
          .from('dashboard_layouts')
          .select('*')
          .limit(1);
        
        if (layoutError) {
          setStatus(`dashboard_layouts table error: ${layoutError.message}`);
        } else {
          setStatus('dashboard_layouts table: OK');
        }

        // Get current session
        const currentSessionId = loadSessionId();
        setSessionId(currentSessionId);
        setStatus(prev => `${prev}\nCurrent session ID: ${currentSessionId || 'None'}`);

      } catch (error: any) {
        setStatus(`Error: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{status}</pre>
    </div>
  );
}
