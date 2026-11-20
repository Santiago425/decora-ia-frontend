import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & { as?: 'section' | 'article' | 'div'; padded?: boolean };

export function Card({ as: Tag = 'section', padded = true, className, ...rest }: CardProps) {
  return <Tag className={['card', padded && 'card-padded', className].filter(Boolean).join(' ')} {...rest} />;
}

interface PanelProps extends Omit<CardProps, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingLevel?: 2 | 3;
}

export function Panel({ title, description, actions, headingLevel = 2, children, className, ...rest }: PanelProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Card className={['panel', className].filter(Boolean).join(' ')} {...rest}>
      <header className="panel-header">
        <div>
          <Heading>{title}</Heading>
          {description && <p className="panel-description">{description}</p>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </header>
      {children}
    </Card>
  );
}
