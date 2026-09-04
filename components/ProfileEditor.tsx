'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'technician';
  room: string | null;
  hostel: string | null;
  specialty: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_active: number;
  created_at: string;
}

export default function ProfileEditor({ user }: { user: { name: string; role: string; room?: string | null } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    room: '',
    hostel: '',
    specialty: '',
    avatar_url: '',
    phone: '',
    bio: '',
    password: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hostels, setHostels] = useState<{ id: string; name: string }[]>([]);
  const [hostelsLoading, setHostelsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setHostelsLoading(true);
      try {
        const [profileRes, hostelsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/hostels'),
        ]);
        const profileData = await profileRes.json();
        const hostelsData = await hostelsRes.json();

        if (profileData.user) {
          setProfile(profileData.user);
          setForm({
            name: profileData.user.name ?? '',
            email: profileData.user.email ?? '',
            room: profileData.user.room ?? '',
            hostel: profileData.user.hostel ?? '',
            specialty: profileData.user.specialty ?? '',
            avatar_url: profileData.user.avatar_url ?? '',
            phone: profileData.user.phone ?? '',
            bio: profileData.user.bio ?? '',
            password: '',
          });
          setAvatarPreview(profileData.user.avatar_url ?? null);
        }

        setHostels(hostelsData.hostels ?? []);
      } catch (err) {
        setError('Unable to load profile data.');
      } finally {
        setLoading(false);
        setHostelsLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? 'Unable to update profile.');
        return;
      }

      if (data?.user) {
        setProfile(data.user);
        setForm({
          name: data.user.name ?? '',
          email: data.user.email ?? '',
          room: data.user.room ?? '',
          hostel: data.user.hostel ?? '',
          specialty: data.user.specialty ?? '',
          avatar_url: data.user.avatar_url ?? '',
          phone: data.user.phone ?? '',
          bio: data.user.bio ?? '',
          password: '',
        });
        setAvatarPreview(data.user.avatar_url ?? null);
      }

      setPassword('');
      setMessage('Profile updated successfully.');
      setError(null);
      router.refresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError('Unable to update profile.');
    } finally {
      setSaving(false);
    }
  }

  function setPassword(value: string) {
    setForm((prev) => ({ ...prev, password: value }));
  }

  function handleAvatarFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setError('Avatar must be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setForm((prev) => ({ ...prev, avatar_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return <div className="text-sm text-ink/40 py-8">Loading profile…</div>;
  }

  return (
    <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr] items-start mb-6">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase">Profile</div>
          <h2 className="font-display text-xl font-semibold">Update your info</h2>
          <p className="mt-2 text-sm text-ink/60">Change your display details, login password, avatar, and contact data.</p>
        </div>
        <div className="rounded-3xl bg-white/5 p-4 text-sm text-ink/70">
          <div className="font-semibold">Profile</div>
          <div className="mt-4 grid gap-3 text-ink/80 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-100 p-3">
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Role</div>
              <div className="mt-2 font-medium text-slate-900">{profile?.role}</div>
            </div>
            {profile?.hostel ? (
              <div className="rounded-2xl bg-slate-100 p-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Hostel</div>
                <div className="mt-2 font-medium text-slate-900">{profile.hostel}</div>
              </div>
            ) : null}
            {profile?.room ? (
              <div className="rounded-2xl bg-slate-100 p-3 sm:col-span-2">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Room</div>
                <div className="mt-2 font-medium text-slate-900">Room {profile.room}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-sm border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-emerald-900">{message}</div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-sm border border-status-urgent/20 bg-status-urgent/10 px-4 py-3 text-sm text-status-urgent">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Avatar</span>
            <div className="mt-1 flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="w-full text-sm text-slate-700"
              />
              {avatarPreview ? (
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 p-3">
                  <img src={avatarPreview} alt="Avatar preview" className="h-14 w-14 rounded-full object-cover" />
                  <div className="text-sm text-slate-600">Selected image preview</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white/70 px-3 py-4 text-sm text-slate-500">
                  Upload a photo from your device.
                </div>
              )}
            </div>
          </label>
        </div>

        {user.role === 'student' || user.role === 'technician' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {user.role === 'student' ? (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Hostel</span>
                  <select
                    value={form.hostel}
                    onChange={(e) => setForm({ ...form, hostel: e.target.value })}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                  >
                    {hostelsLoading ? (
                      <option>Loading hostels…</option>
                    ) : hostels.length > 0 ? (
                      <>
                        <option value="" disabled={!!form.hostel}>
                          Select hostel
                        </option>
                        {hostels.map((h) => (
                          <option key={h.id} value={h.name}>
                            {h.name}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">No hostels available</option>
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Room</span>
                  <input
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                  />
                </label>
              </>
            ) : null}
            {user.role === 'technician' ? (
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Specialty</span>
                <input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        <label className="block">
          <span className="text-xs font-medium text-ink/60">Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full min-h-[100px] resize-none border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink/60">New password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            placeholder="Leave blank to keep current password"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-lg shadow-slate-950/10 transition hover:bg-steel-dark disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
