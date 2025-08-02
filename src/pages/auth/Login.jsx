import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaEyeSlash, FaEye, FaEnvelope, FaLock, FaExclamationTriangle } from "react-icons/fa";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  // Check for session expired message
  useEffect(() => {
    const message = searchParams.get('message');
    const fromProtectedPage = searchParams.get('from');
    
    // Immediately clear session expired URL parameters if user has form data
    if (message === 'session_expired' && (form.email || form.password)) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('from');
      window.history.replaceState({}, '', newUrl);
      return;
    }
    
    // Only show session expired message if:
    // 1. User was redirected from a protected page
    // 2. User is not actively trying to log in (no form data)
    // 3. Not in the middle of a login attempt
    // 4. Not loading
    if (message === 'session_expired' && 
        fromProtectedPage === 'true' && 
        !form.email && 
        !form.password && 
        !loading &&
        !document.querySelector('input[name="email"]')?.value &&
        !document.querySelector('input[name="password"]')?.value) {
      setError('Your session has expired. Please log in again to continue.');
    }
  }, [searchParams, form.email, form.password, loading]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    
    // Clear session expired message when user starts typing
    if (form.email || form.password || e.target.value) {
      const message = searchParams.get('message');
      if (message === 'session_expired') {
        // Clear the URL parameters without page reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('message');
        newUrl.searchParams.delete('from');
        window.history.replaceState({}, '', newUrl);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Clear session expired message immediately when user starts login
    const message = searchParams.get('message');
    if (message === 'session_expired') {
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('from');
      window.history.replaceState({}, '', newUrl);
    }
    
    try {
      console.log('Attempting login with:', form);
      const userData = await login(form);
      console.log('Login successful, user data:', userData);
      console.log('User is_staff:', userData.is_staff);
      console.log('User is_superuser:', userData.is_superuser);
      
      // Navigate based on user role
      if (userData.is_staff || userData.is_superuser) {
        console.log('User is admin, navigating to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('User is customer, navigating to home');
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors with user-friendly messages
      if (err.message) {
        // Use the improved error message from the auth API
        setError(err.message);
      } else if (err.response?.data?.non_field_errors?.[0]) {
        // Handle authentication errors specifically
        const errorMessage = err.response.data.non_field_errors[0];
        if (errorMessage.toLowerCase().includes('password') || 
            errorMessage.toLowerCase().includes('credentials') ||
            errorMessage.toLowerCase().includes('invalid')) {
          setError('Password Incorrect. Please try again.');
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.data?.email) {
        setError(`Email: ${err.response.data.email[0]}`);
      } else if (err.response?.data?.password) {
        setError(`Password: ${err.response.data.password[0]}`);
      } else if (err.response?.status === 401) {
        setError('Password Incorrect. Please try again.');
      } else if (err.response?.status === 400) {
        setError('Please check your input and try again.');
      } else if (err.response?.status === 500) {
        // Handle server errors with HTML responses
        if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
          setError('Server error. Please try again in a few moments.');
        } else {
          setError('Server error. Please try again in a few moments.');
        }
      } else if (!err.response) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaLock className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Session Expired Message */}
          {searchParams.get('message') === 'session_expired' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-600" />
                <p className="text-amber-700 text-sm">Your session has expired. Please log in again to continue.</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
          </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
          />
              </div>
        </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
            />
                <button
                  type="button"
              onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
