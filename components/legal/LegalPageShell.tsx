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
      <article className="rounded-[14px] border border-line bg-surface p-6 sm:p-10">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-ink">
          {title}
        </h1>
        <p className="text-xs text-quiet mb-8">
          <Link href="/" prefetch={false} className="underline underline-offset-2 hover:text-brand">
            ← {backLabel}
          </Link>
        </p>
        <div className="space-y-8 text-sm leading-relaxed text-ink">{children}</div>
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
      <h2 className="font-display text-base font-semibold mb-3 text-brand border-b border-line pb-2">
        {title}
      </h2>
      <div className="space-y-3 text-quiet">{children}</div>
    </section>
  );
}
