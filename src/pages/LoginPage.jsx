// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/"; // Get redirect location or default to home

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true }); // Redirect to the page user was trying to access or home
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <h2 className="mt-6 mb-2 text-center text-3xl font-bold text-text-main hover:text-primary transition-colors">
            ExpertPicks
          </h2>
        </Link>
        <h3 className="mb-8 text-center text-2xl font-semibold text-text-main">
          Sign in to your account
        </h3>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-background py-8 px-6 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-main">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 my-3"> {/* Adjusted padding */}
                <p className="text-sm font-medium text-red-700 text-center">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-primary-text bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Not a member?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;