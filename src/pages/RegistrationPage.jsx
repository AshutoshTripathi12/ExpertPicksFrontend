// src/pages/RegistrationPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth.service';
// import { useAuth } from '../contexts/AuthContext'; // Not strictly needed here unless for conditional UI

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth(); // Example if needed

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || password.length < 8) {
      setError('Name, valid Email, and Password (min 8 characters) are required.');
      // More specific checks can be added for email format client-side if desired
      return;
    }

    setIsLoading(true);
    try {
      const response = await register({ name, email, password });
      setSuccessMessage(response.data.message || 'Registration successful! Please login.');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' }); // Clear form
      
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after successful registration
      }, 2000); // Give user time to see success message
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data).join('; ') : null) || 'Registration failed. Please try again.';
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
          Create your account
        </h3>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-background py-8 px-6 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-main">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

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
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main">
                Password <span className="text-xs text-text-muted">(min. 8 characters)</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-main">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-border-color rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 my-3">
                <p className="text-sm font-medium text-red-700 text-center">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3 my-3">
                <p className="text-sm font-medium text-green-700 text-center">{successMessage}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-primary-text bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;