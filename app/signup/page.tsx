'use client';

import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black mb-2 rotate-1 inline-block hand-title">新規登録</h1>
        <p className="text-[#6a5344]">メグリミナルの掲示板に、名前を貼る</p>
      </div>
      <SignupForm />
    </div>
  );
}
