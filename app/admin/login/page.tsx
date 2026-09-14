import { LoginForm } from '@/components/auth/LoginForm';

/** 掲示板モード中も管理者だけが使えるログイン入口 */
export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <LoginForm defaultRedirect="/admin/reports" minimal />
    </div>
  );
}
