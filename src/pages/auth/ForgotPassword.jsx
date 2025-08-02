import { useState } from 'react';
import { requestPasswordReset } from '../../api/auth';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await requestPasswordReset(email); 
      setMessage('Password reset link sent to your email. Please check your inbox and click the link to reset your password.');
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Handle different types of errors with user-friendly messages
      if (err.message) {
        // Use the improved error message from the auth API
        setMessage(err.message);
      } else if (err.response?.data?.email) {
        setMessage(`Email: ${err.response.data.email[0]}`);
      } else if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else if (err.response?.data?.detail) {
        setMessage(err.response.data.detail);
      } else if (err.response?.status === 400) {
        setMessage('Please check your email address and try again.');
      } else if (err.response?.status === 404) {
        setMessage('Email not found. Please check your email address.');
      } else if (err.response?.status === 500) {
        setMessage('Server error. Please try again in a few moments.');
      } else if (!err.response) {
        setMessage('Network error. Please check your internet connection and try again.');
      } else {
        setMessage('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-scale-in">
          {/* Back Button */}
          <Link
            to="/login"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition-colors group"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Login</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">No worries! Enter your email and we'll send you reset instructions.</p>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl animate-fade-in ${
              message.includes('sent') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('sent') ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaEnvelope className="text-red-600" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaEnvelope className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">Need help?</h3>
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Check your spam folder if you don't see the email</li>
              <li>• Make sure you're using the email associated with your account</li>
              <li>• The reset link expires in 24 hours</li>
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble?{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
