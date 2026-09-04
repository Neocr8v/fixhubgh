import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import TechnicianDashboard from '@/components/TechnicianDashboard';

export default async function TechnicianPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'technician') redirect('/');

  return (
    <AppShell user={user}>
      <TechnicianDashboard user={user} />
    </AppShell>
  );
}
