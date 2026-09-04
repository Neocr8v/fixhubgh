import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'admin') redirect('/');

  return (
    <AppShell user={user}>
      <AdminDashboard />
    </AppShell>
  );
}
