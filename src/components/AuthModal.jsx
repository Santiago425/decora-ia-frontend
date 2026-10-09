import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const EMPTY = { fullName: '', email: '', password: '' };

export function AuthModal() {
  const { modal, openAuth, closeAuth, login, register } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const firstInput = useRef(null);
  const isRegister = modal === 'register';

  useEffect(() => {
    if (!modal) return undefined;
    setError('');
    firstInput.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modal, closeAuth]);

  if (!modal) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (isRegister && !/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(form.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      setForm(EMPTY);
      closeAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeAuth()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="modal-close" onClick={closeAuth} aria-label="Cerrar">×</button>
        <span className="kicker">{isRegister ? 'Nueva cuenta' : 'Bienvenido de nuevo'}</span>
        <h2 id="auth-title">{isRegister ? <>Crea tu <em>cuenta</em></> : <>Inicia <em>sesión</em></>}</h2>

        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'active' : ''} onClick={() => openAuth('login')}>
            Ingresar
          </button>
          <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'active' : ''} onClick={() => openAuth('register')}>
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {isRegister && (
            <label>
              <span>Nombre completo</span>
              <input ref={firstInput} required minLength={2} maxLength={120} autoComplete="name" value={form.fullName} onChange={update('fullName')} />
            </label>
          )}
          <label>
            <span>Correo electrónico</span>
            <input
              ref={isRegister ? undefined : firstInput}
              type="email"
              required
              maxLength={160}
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
            />
          </label>
          <label>
            <span>Contraseña</span>
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={128}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={update('password')}
              />
              <button type="button" className="link-button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </span>
            {isRegister && <small className="hint">Mínimo 8 caracteres, con al menos una letra y un número.</small>}
          </label>

          {error && <p className="alert" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Un momento…</> : isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
