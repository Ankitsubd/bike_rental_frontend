import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaDollarSign, FaMapMarkerAlt, FaStar, FaCheckCircle, FaTimes, FaArrowLeft, FaHistory, FaBicycle, FaShieldAlt } from 'react-icons/fa';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const RentalHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('user/rental-history/');
      setBookings(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load your rental history.');
      console.error('Error fetching rental history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimes className="w-4 h-4" />;
      default:
        return <FaClock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInHours = (end - start) / (1000 * 60 * 60);
    return Math.ceil(diffInHours);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rental history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={fetchRentalHistory}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user/profile')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors group"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Profile</span>
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaHistory className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Rental History</h1>
            <p className="text-xl text-gray-600">View your completed and cancelled bike rentals</p>
          </div>
        </div>

        {/* Rental History List */}
        {bookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center animate-scale-in">
            <div className="text-8xl mb-6 animate-float">📚</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Rental History</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              You haven't completed any rentals yet. Start your journey by booking a bike!
            </p>
            <Link
              to="/bikes"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Bikes
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking, index) => (
              <div 
                key={booking.id} 
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaBicycle className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {booking.bike_name || 'Bike Rental'}
                        </h3>
                        <p className="text-gray-600">
                          Booking #{booking.id}
                        </p>
                      </div>
                    </div>
                    <span className={`px-6 py-3 rounded-2xl text-sm font-semibold border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCalendarAlt className="text-blue-600" />
                        <p className="text-sm text-gray-600">Start Time</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatDate(booking.start_time)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaClock className="text-green-600" />
                        <p className="text-sm text-gray-600">Actual End Time</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatDate(booking.actual_end_time)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaClock className="text-purple-600" />
                        <p className="text-sm text-gray-600">Actual Duration</p>
                      </div>
                      <p className="font-bold text-gray-800">
                        {calculateDuration(booking.start_time, booking.actual_end_time)} hours
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaDollarSign className="text-orange-600" />
                        <p className="text-sm text-gray-600">Actual Total Price</p>
                      </div>
                      <p className="font-bold text-green-600">
                        Rs. {booking.actual_total_price || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {booking.status.toLowerCase() === 'completed' && (
                      <Link
                        to={`/user/review`}
                        state={{ booking: booking }}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg"
                      >
                        <FaStar className="w-4 h-4" />
                        Write Review
                      </Link>
                    )}
                    
                    <Link
                      to={`/bikes/${booking.bike}`}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg"
                    >
                      <FaBicycle className="w-4 h-4" />
                      View Bike Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-green-600" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/user/bookings"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <FaBicycle className="w-4 h-4" />
                View Current Bookings
              </Link>
              <Link
                to="/bikes"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <FaBicycle className="w-4 h-4" />
                Book Another Bike
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalHistory; 