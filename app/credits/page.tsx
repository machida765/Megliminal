import type { Metadata } from 'next';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';
import {
  AVATAR_STYLES,
  DICEBEAR_CORE,
  OTHER_CREDITS,
  type CreditEntry,
} from '@/lib/legal/credits';
import { APP_NAME } from '@/lib/config/app';
import { getMessages } from '@/messages';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

const messages = getMessages(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `${messages.legal.credits} | ${APP_NAME}`,
  description: messages.legal.creditsDescription,
};

function CreditListItem({ entry }: { entry: CreditEntry }) {
  return (
    <li className="rounded-sm border border-line/60 bg-surface px-4 py-3">
      <p className="font-bold text-ink">{entry.name}</p>
      <p className="mt-1 text-xs text-quiet">
        作者: {entry.author}
        <br />
        ライセンス:{' '}
        <a
          href={entry.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline underline-offset-2 hover:text-brand"
        >
          {entry.license}
        </a>
        {' · '}
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline underline-offset-2 hover:text-brand"
        >
          ソース
        </a>
      </p>
      {entry.note ? <p className="mt-2 text-xs text-brand">{entry.note}</p> : null}
    </li>
  );
}

export default function CreditsPage() {
  return (
    <LegalPageShell title={messages.legal.credits} backLabel={messages.common.backToHome}>
      <LegalSection title="デフォルトアバター">
        <p>
          ユーザーがアイコンを設定していない場合、または Google 等のプロフィール画像がない場合に、
          <code className="mx-1 rounded bg-soft/50 px-1.5 py-0.5 text-xs">public/avatars/</code>
          内の SVG を表示します。これらは{' '}
          <a
            href={DICEBEAR_CORE.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2 hover:text-brand"
          >
            DiceBear
          </a>{' '}
          ライブラリで生成しています。
        </p>
        <p className="text-xs text-brand">
          生成スクリプト: <code className="rounded bg-soft/50 px-1">npm run avatars:generate</code>
          {' · '}
          <a
            href="https://www.dicebear.com/licenses/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-brand"
          >
            DiceBear ライセンス一覧
          </a>
        </p>
        <div className="rounded-sm border border-line/60 bg-surface px-4 py-3 text-xs text-quiet">
          <p className="font-bold text-ink">{DICEBEAR_CORE.name}</p>
          <p className="mt-1">
            {DICEBEAR_CORE.note}
            <br />
            作者: {DICEBEAR_CORE.author} ·{' '}
            <a
              href={DICEBEAR_CORE.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline underline-offset-2 hover:text-brand"
            >
              {DICEBEAR_CORE.license}
            </a>
          </p>
        </div>
        <ul className="space-y-2 not-prose">
          {AVATAR_STYLES.map((entry) => (
            <CreditListItem key={entry.name} entry={entry} />
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="その他">
        <ul className="space-y-2">
          {OTHER_CREDITS.map((entry) => (
            <CreditListItem key={entry.name} entry={entry} />
          ))}
        </ul>
      </LegalSection>
    </LegalPageShell>
  );
}
