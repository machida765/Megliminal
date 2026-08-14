'use client';

import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black mb-2 -rotate-1 inline-block hand-title">ログイン</h1>
        <p className="text-[#6a5344]">
          掲示板に名前を書いて、おすすめを貼りましょう
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
