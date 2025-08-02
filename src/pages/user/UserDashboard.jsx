import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import Spinner from "../../components/Spinner";

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', username: '' });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await api.get('user/profile/');
        if (isMounted) {
          setProfile(profileResponse.data);
        }
        
        // Fetch user bookings
        const bookingsResponse = await api.get('user/bookings/');
        if (isMounted) {
          setBookings(bookingsResponse.data);
        }
        
        // Calculate stats
        const totalBookings = bookingsResponse.data.length;
        const activeBookings = bookingsResponse.data.filter(b => 
          ['confirmed', 'in_progress'].includes(b.status.toLowerCase())
        ).length;
        const completedBookings = bookingsResponse.data.filter(b => 
          ['completed', 'returned'].includes(b.status.toLowerCase())
        ).length;
        const totalSpent = bookingsResponse.data.reduce((sum, booking) => {
          const startTime = new Date(booking.start_time);
          const endTime = new Date(booking.end_time);
          const hours = (endTime - startTime) / (1000 * 60 * 60);
          return sum + (hours * (booking.bike_price || 0));
        }, 0);
        
        if (isMounted) {
          setStats({
            totalBookings,
            activeBookings,
            completedBookings,
            totalSpent: Math.round(totalSpent)
          });
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching dashboard data:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('user/profile/', profile);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-sky-100 text-sky-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Welcome back, {profile.name || user?.username || 'User'}! 👋
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600">
            Manage your bike rentals and profile information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚲</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Bookings</p>
                <p className="text-2xl font-bold text-slate-800">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-800">Rs. {stats.totalSpent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Information</h2>
              <p className="text-slate-600">Manage your personal information</p>
            </div>
            
            <div className="p-6">
              {editMode ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Enter your username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-500"
                      placeholder="Email address"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-300 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Full Name</p>
                      <p className="font-semibold text-slate-800">{profile.name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Username</p>
                      <p className="font-semibold text-slate-800">{profile.username || user?.username || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Email</p>
                      <p className="font-semibold text-slate-800">{profile.email || user?.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full bg-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Recent Bookings</h2>
                  <p className="text-slate-600">Your latest bike rentals</p>
                </div>
                <Link
                  to="/user/bookings"
                  className="text-sky-600 hover:text-sky-700 font-semibold"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-800">{booking.bike_name || 'Bike'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>Start: {new Date(booking.start_time).toLocaleDateString()}</p>
                        <p>End: {new Date(booking.end_time).toLocaleDateString()}</p>
                        <p>Price: Rs. {booking.total_price || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🚲</div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Bookings Yet</h3>
                  <p className="text-slate-600 mb-4">Start your adventure by booking your first bike!</p>
                  <Link
                    to="/bikes"
                    className="inline-block bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-300"
                  >
                    Browse Bikes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Quick Actions</h2>
            <p className="text-slate-600">Access your most used features</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/bikes"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-sky-50 hover:border-sky-300 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-sky-600">🚲</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Browse Bikes</h3>
                  <p className="text-sm text-slate-600">Find your perfect ride</p>
                </div>
              </Link>
              
              <Link
                to="/user/bookings"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-emerald-600">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">My Bookings</h3>
                  <p className="text-sm text-slate-600">Manage rentals</p>
                </div>
              </Link>
              
              <Link
                to="/user/reviews"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-cyan-600">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">My Reviews</h3>
                  <p className="text-sm text-slate-600">Share your experience</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
