import { redirect } from 'next/navigation';

// The submission flow now lives at /request ("Request a List").
// Keep /submit working by redirecting any old links/bookmarks.
export default function SubmitPage() {
  redirect('/request');
}
