import dynamic from 'next/dynamic';
const MemoBoard = dynamic(() => import('@/components/MemoBoard'), { ssr: false });

export default function MemoPage() {
  return <MemoBoard />;
}
