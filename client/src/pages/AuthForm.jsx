import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AuthForm({ mode }) {
  const isReg = mode === 'register';
  const { user, login, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (isReg && f.name.trim().length < 2) return setError('Enter your name (2+ characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setError('Enter a valid email address.');
    if (f.password.length < (isReg ? 8 : 1)) return setError(isReg ? 'Password must be at least 8 characters.' : 'Enter your password.');
    setBusy(true); setError('');
    try {
      await (isReg ? register(f) : login({ email: f.email, password: f.password }));
      toast.success(isReg ? 'Account created. Welcome!' : 'Welcome back!');
      nav('/');
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <section className="auth-art">
        <span className="brand"><CheckCheck size={24} /> Taskly</span>
        <h1>Plan the week.<br />Finish the work.</h1>
        <p>One place for deadlines, priorities and progress — so nothing slips past its due date.</p>
      </section>
      <section className="auth-panel">
        <form onSubmit={submit} noValidate>
          <h2>{isReg ? 'Create your account' : 'Log in'}</h2>
          <p className="muted">{isReg ? 'It takes less than a minute.' : 'Pick up where you left off.'}</p>
          {error && <div className="alert" role="alert">{error}</div>}
          {isReg && <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>}
          <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} placeholder={isReg ? 'At least 8 characters' : ''} /></label>
          <button className="btn primary block" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
          <p className="switch">{isReg ? 'Already have an account?' : 'New here?'} <Link to={isReg ? '/login' : '/register'}>{isReg ? 'Log in' : 'Create an account'}</Link></p>
        </form>
      </section>
    </div>
  );
}
