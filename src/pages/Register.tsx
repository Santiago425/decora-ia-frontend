import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { config } from '../config';
import { useAuth } from '../hooks/useAuth';
import { notificationCenter } from '../services/notificationCenter';
import { validateEmail, validateFullName, validatePassword } from '../utils/validation';

type Errors = Partial<Record<'fullName' | 'email' | 'password' | 'confirm', string | null>>;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {
      fullName: validateFullName(form.fullName),
      email: validateEmail(form.email),
      password: validatePassword(form.password, { strict: true }),
      confirm: form.confirm === form.password ? null : 'Las contraseñas no coinciden',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    setServerError('');
    try {
      const user = await register({ full_name: form.fullName.trim(), email: form.email.trim(), password: form.password });
      notificationCenter.notify(`Bienvenido a ${config.appName}, ${user.full_name.split(' ')[0]}`, 'success');
      navigate('/', { replace: true });
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a transformar tus espacios en minutos">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nombre"
          icon={UserRound}
          autoComplete="name"
          placeholder="Tu nombre"
          value={form.fullName}
          onChange={update('fullName')}
          error={errors.fullName}
        />
        <FormField
          label="Correo"
          icon={Mail}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <div className="field-row">
          <FormField
            label="Contraseña"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="Mín. 8, letras y números"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <FormField
            label="Repetir"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={form.confirm}
            onChange={update('confirm')}
            error={errors.confirm}
          />
        </div>
        {serverError && (
          <p className="form-alert" role="alert">
            {serverError}
          </p>
        )}
        <button className="button button-primary button-block" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
