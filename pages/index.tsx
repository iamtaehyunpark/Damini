import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Header, { WidgetType } from '@/components/Header';

// react-grid-layout relies on window; disable SSR for Dashboard
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });

export default function Home() {
  const [addHandler, setAddHandler] = useState<((type: WidgetType) => void) | null>(null);

  return (
    <>
      <Head>
        <title>damin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Header onAddWidget={(type) => addHandler?.(type)} />
          <div className="mt-6">
            <Dashboard onRegisterAdd={(fn) => setAddHandler(() => fn)} />
          </div>
        </div>
      </div>
    </>
  );
}
