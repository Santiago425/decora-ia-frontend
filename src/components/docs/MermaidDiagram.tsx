import { useEffect, useId, useRef, useState } from 'react';

type Mermaid = typeof import('mermaid').default;
let loader: Promise<Mermaid> | null = null;

function loadMermaid(): Promise<Mermaid> {
  loader ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Plus Jakarta Sans Variable, system-ui, sans-serif',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#f6f1e9',
        primaryBorderColor: '#a47551',
        primaryTextColor: '#23302a',
        secondaryColor: '#dfe5d6',
        tertiaryColor: '#fbf8f3',
        lineColor: '#7f857f',
        textColor: '#23302a',
        fontSize: '14px',
      },
    });
    return mermaid;
  });
  return loader;
}

export function MermaidDiagram({ code, label }: { code: string; label: string }) {
  const id = `m${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => mermaid.render(id, code))
      .then(({ svg: rendered }) => !cancelled && setSvg(rendered))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [visible, code, id]);

  return (
    <div ref={container} className="mermaid-box" role="img" aria-label={label}>
      {svg ? (
        <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : failed ? (
        <pre className="mermaid-code">{code}</pre>
      ) : (
        <div className="mermaid-loading">Dibujando diagrama…</div>
      )}
    </div>
  );
}
