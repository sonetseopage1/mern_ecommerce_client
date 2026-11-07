import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Create account', robots: { index: false } };
export default function Page() { return <AuthForm mode="register" />; }
