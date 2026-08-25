import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import StudentDashboard from '@/components/StudentDashboard';

export default function StudentPage() {
  const user = getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'student') redirect('/');

  return (
    <AppShell user={user}>
      <StudentDashboard user={user} />
    </AppShell>
  );
}
