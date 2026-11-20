import { ArrowRight, Lock, Mail } from 'lucide-react';
import { DemoAccess } from '../components/DemoAccess';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { RoleSwitch } from '../components/RoleSwitch';
import { useAuth } from '../hooks/useAuth';
import { notificationCenter } from '../services/notificationCenter';
import type { UserRole } from '../types/auth';
import type { DemoAccount } from '../types/meta';
import { validateEmail, validatePassword } from '../utils/validation';
import { Button } from '../components/ui';
import { demoGreeting, metaService } from '../services/metaService';
import { preloadHandlers } from '../routes/pages';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn(credentials: { email: string; password: string; role: UserRole }) {
    setLoading(true);
    setServerError('');
    try {
      const user = await login(credentials);
      const from = (location.state as { from?: string } | null)?.from;
      const meta = await metaService.publicMeta().catch(() => null);
      const welcome = demoGreeting(meta, user.email) || `Hola de nuevo, ${user.full_name.split(' ')[0]}`;
      notificationCenter.notify(welcome, 'success');
      navigate(from ?? '/', { replace: true });
    } catch (error) {
      setServerError((error as Error).message);
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    void signIn({ email: email.trim(), password, role });
  }

  function handleDemo(account: DemoAccount) {
    setRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    void signIn({ email: account.email, password: account.password, role: account.role });
  }

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Entra para seguir diseñando tus espacios">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <RoleSwitch value={role} onChange={setRole} />
        <FormField
          label="Correo"
          icon={Mail}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {serverError && (
          <p className="form-alert" role="alert">
            {serverError}
          </p>
        )}
        <Button block type="submit" disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true" /> : null}
          {loading ? 'Entrando…' : role === 'admin' ? 'Entrar como administrador' : 'Entrar'}
          {!loading && <ArrowRight size={18} />}
        </Button>
      </form>
      <DemoAccess disabled={loading} onSelect={handleDemo} />
      <p className="auth-switch">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" {...preloadHandlers('/register')}>
          Créala gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
