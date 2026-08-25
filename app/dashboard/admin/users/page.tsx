import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminHostelManagement from '@/components/AdminHostelManagement';

export default function AdminUsersPage() {
  const user = getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'admin') redirect('/');

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <AdminHostelManagement />
        <AdminUserManagement />
      </div>
    </AppShell>
  );
}
