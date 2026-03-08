import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/stores');
  return null;
}
