import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/apiError.js';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  // ProtectedRoute remembers where the user was heading; go back there after logging in
  const from = location.state?.from?.pathname ?? '/';

  // Controlled form: one state object holds every field
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // [e.target.name] is a computed key, so one handler updates whichever input changed
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // without this the browser reloads the page and React state is lost
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/auth/login`, formData);
      // login() stores the returned JWT in localStorage (see AuthContext.jsx)
      login(res.data.access_token);
    } catch (err) {
      setError(getErrorMessage(err, { 401: 'Incorrect email or password.' }));
    } finally {
      setSubmitting(false);
    }
  };

  // Once the token is saved (or if the user is already signed in), leave this page
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-slate-600">Welcome back. Log in to book study spaces and request books.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.email || !formData.password}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-indigo-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
