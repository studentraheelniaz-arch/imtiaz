import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || { pathname: '/' };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await api.login({ email, password });
      login(token, user);
      navigate(from.pathname + (from.search || ''), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-14">
      <h1 className="font-display text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-road-950/60">Welcome back to Imtiaz Tayara.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label-field">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in…' : 'Log in'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-road-950/60">
        New here? <Link to="/register" className="font-semibold text-magenta-500">Create an account</Link>
      </p>
    </div>
  );
}
