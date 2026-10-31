import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { RoleSwitch } from '../components/RoleSwitch';
import { useAuth } from '../hooks/useAuth';
import { notificationCenter } from '../services/notificationCenter';
import type { UserRole } from '../types/auth';
import { validateEmail, validatePassword } from '../utils/validation';

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setLoading(true);
    setServerError('');
    try {
      const user = await login({ email: email.trim(), password, role });
      const from = (location.state as { from?: string } | null)?.from;
      notificationCenter.notify(`Hola de nuevo, ${user.full_name.split(' ')[0]}`, 'success');
      navigate(from ?? '/', { replace: true });
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setLoading(false);
    }
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
        <button className="button button-primary button-block" disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true" /> : null}
          {loading ? 'Entrando…' : role === 'admin' ? 'Entrar como administrador' : 'Entrar'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="auth-switch">
        ¿Aún no tienes cuenta? <Link to="/register">Créala gratis</Link>
      </p>
    </AuthLayout>
  );
}
