import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaEnvelope, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { changePassword } from '../../api/auth';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.old_password.trim()) {
      newErrors.old_password = 'Current password is required';
    }
    
    if (!formData.new_password.trim()) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setErrors({});
      
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      
      setMessage('Password changed successfully!');
      
      // Clear form
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Navigate back after 3 seconds
      setTimeout(() => {
        navigate('/user/profile');
      }, 3000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle different types of errors with user-friendly messages
      if (error.message) {
        // Use the improved error message from the auth API
        setMessage(error.message);
      } else if (error.response?.data?.old_password) {
        setErrors({ old_password: 'Old password wrong please input current password.' });
      } else if (error.response?.data?.new_password) {
        setErrors({ new_password: error.response.data.new_password[0] });
      } else if (error.response?.data?.detail) {
        setMessage(error.response.data.detail);
      } else if (error.response?.status === 401) {
        setErrors({ old_password: 'Old password wrong please input current password.' });
      } else if (error.response?.status === 400) {
        setMessage('Please check your input and try again.');
      } else if (error.response?.status === 500) {
        setMessage('Server error. Please try again in a few moments.');
      } else if (!error.response) {
        setMessage('Network error. Please check your internet connection and try again.');
      } else {
        setMessage('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-scale-in">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/user/profile')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors group"
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Profile</span>
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Change Password</h1>
              <p className="text-gray-600">Update your password to keep your account secure</p>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl animate-fade-in ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('successfully') ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaEnvelope className="text-red-600" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* Password Change Form */}
          <div className="bg-white/50 rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaLock className="text-indigo-600 w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                      errors.old_password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                    }`}
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('old')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.old ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.old_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.old_password}</p>
                )}
              </div>
              
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                      errors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                    }`}
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.new ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
              
              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                      errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                    }`}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.confirm ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <FaLock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">Security Tips</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li>• Use a strong password with at least 8 characters</li>
              <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• You'll receive an email verification after changing your password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 