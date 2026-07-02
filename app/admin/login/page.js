import { isAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Login | Source of Truths',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  if (isAdmin()) {
    redirect('/admin');
  }
  return <LoginClient />;
}
