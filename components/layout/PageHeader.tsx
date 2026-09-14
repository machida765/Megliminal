import type { ReactNode } from 'react';

type PageHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function PageHeader({ kicker, title, description, icon }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="section-kicker">
        {icon}
        {kicker}
      </p>
      <h1 className="font-display">{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
