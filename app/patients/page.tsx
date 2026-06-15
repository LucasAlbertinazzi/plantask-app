import { redirect } from 'next/navigation';

export default function PatientsPage() {
  // If user navigates to /patients directly, redirect to the dashboard which handles patients.
  redirect('/');
}
