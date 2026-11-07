import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Login', robots: { index: false } };
export default function Page() { return <AuthForm mode="login" />; }
