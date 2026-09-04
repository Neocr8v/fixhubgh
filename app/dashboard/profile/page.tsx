import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import ProfileEditor from '@/components/ProfileEditor';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  return (
    <AppShell user={user}>
      <ProfileEditor user={user} />
    </AppShell>
  );
}
