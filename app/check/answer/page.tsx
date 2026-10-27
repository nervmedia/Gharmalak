import type { Metadata } from 'next';
import { CheckHeader, CheckFooter } from '@/components/CheckShell';
import { AnswerFlow } from './AnswerFlow';

export const metadata: Metadata = {
  title: { absolute: 'Gharmalak Check · For residents' },
  description: 'Live in Wakad or Hinjewadi? Answer 10 questions about your building and get paid by UPI. Your name is never shown.',
  robots: { index: false, follow: false },
};

export default function AnswerPage() {
  return (
    <>
      <CheckHeader />
      <main id="main" className="page"><div className="wrap"><AnswerFlow /></div></main>
      <CheckFooter />
    </>
  );
}
