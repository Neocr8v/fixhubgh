import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const user = getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'admin') redirect('/');

  return (
    <AppShell user={user}>
      <AdminDashboard />
    </AppShell>
  );
}
