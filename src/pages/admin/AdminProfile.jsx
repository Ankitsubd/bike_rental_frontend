import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: ''
  });
  
  // Password change form states
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Initialize form with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [user]);

  // Fetch fresh profile data on component mount (only once)
  const loadProfileData = useCallback(async () => {
    try {
      setProfileLoading(true);
      const response = await api.get('user/profile/');
      
      // Update form with fresh data
      setProfileForm({
        username: response.data.username || '',
        email: response.data.email || '',
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || ''
      });
      
      // Update user context without causing re-renders
      updateUser(response.data);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading profile data:', error);
      // If authentication fails, don't show loading spinner indefinitely
      setProfileLoading(false);
    } finally {
      setProfileLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    // Only load profile data if user is authenticated and we haven't loaded yet
    if (user && !dataLoaded) {
      loadProfileData();
    } else if (!user) {
      setProfileLoading(false);
    }
  }, [user, dataLoaded, loadProfileData]); // Add loadProfileData to dependencies



  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending profile data:', profileForm);
      const response = await api.put('user/profile/', profileForm);
      console.log('Profile update response:', response.data);
      
      // Update the user context with new data
      updateUser(response.data);
      
      // Update the form with the response data to ensure consistency
      setProfileForm({
        username: response.data.username || '',
        email: response.data.email || '',
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || ''
      });
      
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setConfirmAction(() => async () => {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      try {
        await api.patch('change-password/', {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        });
        
        setSuccess('Password changed successfully!');
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setShowPasswordForm(false);
        setShowConfirmModal(false);
      } catch (err) {
        console.error('Error changing password:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to change password';
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    });
    
    setShowConfirmModal(true);
  };



  // Show loading spinner only when actually loading data
  if (profileLoading && user) return <Spinner />;

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p className="text-red-100 text-sm mt-1">Please log in to access your profile</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/40 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
            <span className="text-blue-600 text-2xl md:text-4xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Admin Profile
            </h1>
            <p className="text-lg md:text-xl text-blue-600 font-medium">👤 Manage your account settings and security</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Administrator
                </span>
              </div>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600">Loading profile data...</span>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profileForm.phone_number}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isSubmitting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
            )}
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="old_password"
                      value={passwordForm.old_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                      {showOldPassword ? (
                        <FaEyeSlash className="text-slate-500" onClick={() => setShowOldPassword(false)} />
                      ) : (
                        <FaEye className="text-slate-500" onClick={() => setShowOldPassword(true)} />
                      )}
                    </span>
                  </div>
            </div>
                
            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                      {showNewPassword ? (
                        <FaEyeSlash className="text-slate-500" onClick={() => setShowNewPassword(false)} />
                      ) : (
                        <FaEye className="text-slate-500" onClick={() => setShowNewPassword(true)} />
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
            </div>
                
            <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-slate-500" onClick={() => setShowConfirmPassword(false)} />
                      ) : (
                        <FaEye className="text-slate-500" onClick={() => setShowConfirmPassword(true)} />
                      )}
                    </span>
            </div>
          </div>
          
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    isSubmitting 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Password Security</h3>
                  <p className="text-sm text-orange-700">
                    Keep your account secure by regularly updating your password. 
                    Use a strong password with at least 8 characters.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Admin Permissions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Manage all bikes (add, edit, delete)</li>
              <li>• View and manage all bookings</li>
              <li>• Moderate user reviews</li>
              <li>• Access admin dashboard</li>
              <li>• View system statistics</li>
            </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No admin information available.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Change Password</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to change your password? You will need to use the new password for your next login.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;