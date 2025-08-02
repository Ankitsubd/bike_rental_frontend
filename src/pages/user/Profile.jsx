import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../api/auth';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaBicycle, FaHistory, FaCog, FaPhone, FaShieldAlt, FaCalendarAlt, FaStar } from 'react-icons/fa';

const Profile = () => {
  const [profile, setProfile] = useState({ full_name: '', email: '', username: '', first_name: '', last_name: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({ total_bookings: 0 });

  // Memoized load profile function
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      setErrors({});
      
      // Fetch profile data
      const data = await getUserProfile();
      setProfile(data);
      
      // Fetch user stats
      try {
        const statsResponse = await api.get('user/dashboard-stats/');
        setStats(statsResponse.data);
      } catch (statsError) {
        console.error('Error loading stats:', statsError);
        // Don't show error for stats, just keep default value
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Failed to load profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!profile.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (profile.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!profile.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      // Basic phone number validation
      const phoneRegex = /^[\d\s\-+()]+$/;
      if (!phoneRegex.test(profile.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setErrors({});
      
      await updateUserProfile(profile);
      setEditMode(false);
      setMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    setEditMode(false);
    loadProfile(); // Reload original data
    setMessage('');
    setErrors({});
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: <FaBicycle className="w-6 h-6" />,
      title: "My Bookings",
      description: "View and manage your current bike rentals",
      link: "/user/bookings",
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: <FaHistory className="w-6 h-6" />,
      title: "Rental History",
      description: "Check your completed and cancelled rentals",
      link: "/user/rental-history",
      color: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      icon: <FaCog className="w-6 h-6" />,
      title: "Change Password",
      description: "Update your password securely",
      link: "/user/change-password",
      color: "bg-gradient-to-r from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaUser className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-xl text-gray-600">Manage your personal information and preferences</p>
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
                <FaShieldAlt className="text-green-600" />
              ) : (
                <FaTimes className="text-red-600" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <FaUser className="text-indigo-600 w-6 h-6" />
                  <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                </div>
                <p className="text-gray-600 mt-2">Update your profile details</p>
              </div>
              
              <div className="p-6">
                {editMode ? (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="full_name"
                          value={profile.full_name}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                            errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                          }`}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      {errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                            errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                          }`}
                          placeholder="Enter your username"
                          required
                        />
                      </div>
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone_number"
                          value={profile.phone_number || ''}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                            errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                          }`}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      {errors.phone_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                          placeholder="Email address"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Email address cannot be changed for security reasons
                      </p>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        <FaTimes className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 border border-indigo-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <FaUser className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Full Name</p>
                          <p className="font-bold text-gray-800 text-lg">{profile.full_name || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl hover:from-green-100 hover:to-blue-100 transition-all duration-300 border border-green-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <FaUser className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Username</p>
                          <p className="font-bold text-gray-800 text-lg">{profile.username || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <FaPhone className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                          <p className="font-bold text-gray-800 text-lg">{profile.phone_number || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl hover:from-orange-100 hover:to-red-100 transition-all duration-300 border border-orange-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                          <FaEnvelope className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Email</p>
                          <p className="font-bold text-gray-800 text-lg">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaEdit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 animate-scale-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="block p-4 rounded-2xl border border-gray-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-white/50 hover:bg-white/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${action.color} text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 animate-scale-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-blue-600" />
                    <span className="text-gray-600">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <FaBicycle className="text-green-600" />
                    <span className="text-gray-600">Total Rentals</span>
                  </div>
                  <span className="font-semibold text-gray-800">{stats.total_bookings}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <FaStar className="text-purple-600" />
                    <span className="text-gray-600">Account Status</span>
                  </div>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;