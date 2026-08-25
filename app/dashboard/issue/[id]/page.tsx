import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import IssueDetail from '@/components/IssueDetail';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/');

  return (
    <AppShell user={user}>
      <IssueDetail id={params.id} user={user} />
    </AppShell>
  );
}
