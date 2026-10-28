import type { Metadata } from 'next';
import { CheckHeader, CheckFooter } from '@/components/CheckShell';
import { AnswerFlow } from './AnswerFlow';

export const metadata: Metadata = {
  title: { absolute: 'Gharmalak Check · For owners' },
  description: 'Own a flat in Wakad or Hinjewadi? Answer 10 questions for homebuyers and get paid by UPI. Your name is never shown.',
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
