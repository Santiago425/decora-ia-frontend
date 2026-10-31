import { ChevronDown, Copy, Database, Layers, Puzzle, Search, ShieldCheck, User, Wrench } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { MermaidDiagram } from '../components/docs/MermaidDiagram';
import { config } from '../config';
import { ARCHITECTURE_DIAGRAM, ER_DIAGRAM, PATTERNS, type PatternCategory, type PatternDoc, type Side } from '../docs/patterns';
import { useAsync } from '../hooks/useAsync';
import { metaService } from '../services/metaService';
import { notificationCenter } from '../services/notificationCenter';

const CATEGORIES: PatternCategory[] = ['Creacional', 'Estructural', 'Comportamiento', 'Arquitectura'];
const SIDES: Side[] = ['Backend', 'Frontend'];

const SECTIONS = [
  { id: 'arquitectura', label: 'Arquitectura', icon: Layers },
  { id: 'cuentas', label: 'Cuentas de prueba', icon: User },
  { id: 'base-de-datos', label: 'Base de datos', icon: Database },
  { id: 'patrones', label: 'Patrones', icon: Puzzle },
  { id: 'tecnologias', label: 'Tecnologías', icon: Wrench },
];

const STACK = [
  { area: 'Frontend', items: ['React 18 + TypeScript', 'Vite', 'React Router', 'React Three Fiber + drei (3D)', 'Recharts', 'Web Speech API (voz)'] },
  { area: 'Backend', items: ['Python + FastAPI', 'SQLAlchemy 2 + Alembic', 'Pydantic v2', 'JWT + bcrypt', 'slowapi (límite de peticiones)', 'pytest'] },
  { area: 'Datos e IA', items: ['PostgreSQL en Neon', 'Google Gemini', 'Hugging Face (imágenes)', 'Modo demo sin IA'] },
  { area: 'Despliegue', items: ['Vercel (frontend)', 'Render (backend)', 'Variables en .env, nada fijo en el código'] },
];

const PROVIDER_LABELS: Record<string, string> = { gemini: 'Google Gemini', huggingface: 'Hugging Face', mock: 'Modo demo' };

function copy(text: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => notificationCenter.notify('Copiado', 'success'))
    .catch(() => undefined);
}

function PatternCard({ pattern }: { pattern: PatternDoc }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`pattern-card ${open ? 'open' : ''}`}>
      <button className="pattern-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div>
          <div className="pattern-tags">
            <span className={`tag tag-${pattern.category.toLowerCase()}`}>{pattern.category}</span>
            <span className="tag tag-side">{pattern.side}</span>
          </div>
          <h3>{pattern.name}</h3>
          <p>{pattern.summary}</p>
        </div>
        <ChevronDown size={20} className="pattern-chevron" />
      </button>
      {open && (
        <div className="pattern-body">
          <div className="pattern-text">
            <h4>Problema</h4>
            <p>{pattern.problem}</p>
            <h4>Solución</h4>
            <p>{pattern.solution}</p>
            <h4>Dónde está</h4>
            <ul className="file-list">
              {pattern.files.map((file) => (
                <li key={file}>
                  <code>{file}</code>
                </li>
              ))}
            </ul>
          </div>
          <MermaidDiagram code={pattern.diagram} label={`Diagrama UML de ${pattern.name}`} />
        </div>
      )}
    </article>
  );
}

export default function Docs() {
  const { data: info } = useAsync(useCallback(() => metaService.info(), []));
  const [category, setCategory] = useState<PatternCategory | 'all'>('all');
  const [side, setSide] = useState<Side | 'all'>('all');
  const [text, setText] = useState('');

  const patterns = useMemo(() => {
    const query = text.trim().toLowerCase();
    return PATTERNS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (side === 'all' || p.side === side) &&
        (!query || `${p.name} ${p.summary} ${p.files.join(' ')}`.toLowerCase().includes(query)),
    );
  }, [category, side, text]);

  const distinct = new Set(PATTERNS.map((p) => p.name.replace(/ \+.*| de protección/, ''))).size;

  return (
    <div className="page docs-page">
      <header className="page-header docs-hero">
        <span className="docs-kicker">Proyecto final · Patrones de Diseño</span>
        <h1>Documentación de {config.appName}</h1>
        <p className="page-subtitle">
          Cómo está construida la app: arquitectura, base de datos y los {distinct} patrones de diseño aplicados ({PATTERNS.length} usos
          entre backend y frontend), cada uno con su diagrama UML.
        </p>
        <nav className="docs-index" aria-label="Secciones">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`}>
              <Icon size={16} /> {label}
            </a>
          ))}
        </nav>
      </header>

      <section id="arquitectura" className="docs-section">
        <h2>Arquitectura</h2>
        <p>
          El frontend y el backend viven en repositorios separados y se comunican por una API REST con sesiones JWT. El backend está
          organizado por capas: <strong>routers → services → repositories → models</strong>. La IA está separada detrás de adaptadores, así
          que el modelo se cambia desde el <code>.env</code> sin tocar código.
        </p>
        <MermaidDiagram code={ARCHITECTURE_DIAGRAM} label="Diagrama de arquitectura" />
        {info && (
          <dl className="docs-facts">
            <div>
              <dt>IA de texto (Lumi y sugerencias)</dt>
              <dd>{PROVIDER_LABELS[info.providers.text] ?? info.providers.text}</dd>
            </div>
            <div>
              <dt>IA de imágenes (rediseño)</dt>
              <dd>{PROVIDER_LABELS[info.providers.image] ?? info.providers.image}</dd>
            </div>
            <div>
              <dt>API</dt>
              <dd>
                <a href={`${config.apiBaseUrl}/docs`} target="_blank" rel="noreferrer">
                  Swagger {info.api_prefix}/docs
                </a>
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section id="cuentas" className="docs-section">
        <h2>Cuentas de prueba</h2>
        <p>Se crean solas al iniciar el servidor. En el login, elige el tipo de cuenta antes de entrar.</p>
        {info && info.demo_accounts.length > 0 ? (
          <div className="account-grid">
            {info.demo_accounts.map((account) => (
              <article key={account.email} className="account-card">
                <span className={`account-icon ${account.role}`}>{account.role === 'admin' ? <ShieldCheck size={20} /> : <User size={20} />}</span>
                <div>
                  <h3>{account.role === 'admin' ? 'Administrador' : 'Usuario'}</h3>
                  <small>{account.name}</small>
                </div>
                <dl>
                  <div>
                    <dt>Correo</dt>
                    <dd>
                      <code>{account.email}</code>
                      <button className="icon-button" onClick={() => copy(account.email)} aria-label="Copiar correo">
                        <Copy size={14} />
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt>Contraseña</dt>
                    <dd>
                      <code>{account.password}</code>
                      <button className="icon-button" onClick={() => copy(account.password)} aria-label="Copiar contraseña">
                        <Copy size={14} />
                      </button>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="panel-empty">{info ? 'Las cuentas de prueba están ocultas en este servidor.' : 'Cargando…'}</p>
        )}
      </section>

      <section id="base-de-datos" className="docs-section">
        <h2>Base de datos</h2>
        <p>
          PostgreSQL en la nube (Neon). Tablas y columnas en inglés. El catálogo (estilos, habitaciones, muebles, materiales, paletas y
          complementos) vive en la base de datos y el administrador lo edita desde la app. Las migraciones se manejan con Alembic.
        </p>
        <MermaidDiagram code={ER_DIAGRAM} label="Diagrama entidad relación" />
      </section>

      <section id="patrones" className="docs-section">
        <h2>Patrones de diseño</h2>
        <div className="docs-filters">
          <label className="search-box">
            <Search size={18} />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar patrón o archivo" aria-label="Buscar patrón" />
          </label>
          <div className="chips" role="group" aria-label="Tipo de patrón">
            {(['all', ...CATEGORIES] as const).map((c) => (
              <button key={c} className={`chip ${category === c ? 'selected' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Lado">
            {(['all', ...SIDES] as const).map((s) => (
              <button key={s} className={`chip ${side === s ? 'selected' : ''}`} aria-pressed={side === s} onClick={() => setSide(s)}>
                {s === 'all' ? 'Back y front' : s}
              </button>
            ))}
          </div>
        </div>
        <p className="muted">
          {patterns.length} de {PATTERNS.length} · toca uno para ver el problema, la solución y su diagrama UML
        </p>
        <div className="pattern-list">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </section>

      <section id="tecnologias" className="docs-section">
        <h2>Tecnologías</h2>
        <div className="stack-grid">
          {STACK.map((group) => (
            <article key={group.area} className="stack-card">
              <h3>{group.area}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
