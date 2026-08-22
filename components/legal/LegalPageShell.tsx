import Link from 'next/link';

type LegalPageShellProps = {
  title: string;
  backLabel: string;
  children: React.ReactNode;
};

/** 利用規約・プライバシー・クレジットなどの共通レイアウト */
export function LegalPageShell({ title, backLabel, children }: LegalPageShellProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <article className="rounded-md border-[3px] border-[#e8c9a4] bg-[#fff8ee] p-6 sm:p-10 shadow-[4px_4px_0_#e8c9a4]">
        <h1 className="text-2xl sm:text-3xl font-black mb-2 -rotate-1 hand-title text-[#3b2a22]">
          {title}
        </h1>
        <p className="text-xs text-[#b56a38] mb-8">
          <Link href="/" prefetch={false} className="underline underline-offset-2 hover:text-[#ef7d3b]">
            ← {backLabel}
          </Link>
        </p>
        <div className="space-y-8 text-sm leading-relaxed text-[#3b2a22]">{children}</div>
      </article>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-black mb-3 text-[#b56a38] border-b border-dashed border-[#e8c9a4] pb-2">
        {title}
      </h2>
      <div className="space-y-3 text-[#5a4338]">{children}</div>
    </section>
  );
}
