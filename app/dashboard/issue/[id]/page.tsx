import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import IssueDetail from '@/components/IssueDetail';

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  return (
    <AppShell user={user}>
      <IssueDetail id={params.id} user={user} />
    </AppShell>
  );
}
