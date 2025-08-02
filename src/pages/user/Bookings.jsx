import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaDollarSign, FaMapMarkerAlt, FaStar, FaCheckCircle, FaTimes, FaPlay, FaStop, FaBan, FaEdit, FaBicycle, FaHistory, FaShieldAlt } from 'react-icons/fa';
import api from '../../api/axios';
import { cancelBooking, startRide, endRide } from '../../api/bookings';
import useBike from '../../hooks/useBike';
import Spinner from '../../components/Spinner';
import ConfirmationModal from '../../components/ConfirmationModal';

const Bookings = () => {
  const { updateBikeStatus } = useBike();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: null,
    bookingId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: ''
  });
  const [costBreakdownModal, setCostBreakdownModal] = useState({
    isOpen: false,
    data: null
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBookings();
    
    // Check for success message from review page
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('user/current-bookings/');
      setBookings(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load your current bookings. Please try again later.');
      console.error('Error fetching current bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (bookingId) => {
    setConfirmationModal({
      isOpen: true,
      action: 'cancel',
      bookingId,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      confirmText: 'Yes, Cancel',
      confirmColor: 'bg-red-600 hover:bg-red-700'
    });
  };

  const handleConfirmAction = async () => {
    const { action, bookingId } = confirmationModal;
    
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: true }));
      
      if (action === 'cancel') {
        await cancelBooking(bookingId);
        // Update bike status to available when booking is cancelled
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.bike) {
          updateBikeStatus(booking.bike, 'available');
        }
      } else if (action === 'start') {
        await startRide(bookingId);
        // Update bike status to in_use when ride starts
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.bike) {
          updateBikeStatus(booking.bike, 'in_use');
        }
      } else if (action === 'end') {
        const response = await endRide(bookingId);
        
        // Update bike status to available when ride ends
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.bike) {
          updateBikeStatus(booking.bike, 'available');
        }
        
        // Show cost breakdown modal
        setCostBreakdownModal({
          isOpen: true,
          data: response.data
        });
        return; // Don't refresh bookings since we're showing the modal
      }
      
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (action === 'start') {
        errorMessage = 'Failed to start ride. Please try again.';
      } else if (action === 'end') {
        errorMessage = 'Failed to end ride. Please try again.';
      } else if (action === 'cancel') {
        errorMessage = 'Failed to cancel booking. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
      setConfirmationModal({ isOpen: false, action: null, bookingId: null, title: '', message: '', confirmText: '', confirmColor: '' });
    }
  };

  const handleCloseModal = () => {
    setConfirmationModal({ isOpen: false, action: null, bookingId: null, title: '', message: '', confirmText: '', confirmColor: '' });
  };

  const handleStartRide = (bookingId) => {
    setConfirmationModal({
      isOpen: true,
      action: 'start',
      bookingId,
      title: 'Start Ride',
      message: 'Are you ready to start your ride?',
      confirmText: 'Yes, Start Ride',
      confirmColor: 'bg-blue-600 hover:bg-blue-700'
    });
  };

  const handleEndRide = (bookingId) => {
    setConfirmationModal({
      isOpen: true,
      action: 'end',
      bookingId,
      title: 'End Ride',
      message: 'Are you sure you want to end your ride?',
      confirmText: 'Yes, End Ride',
      confirmColor: 'bg-orange-600 hover:bg-orange-700'
    });
  };

  const handleWriteReview = (booking) => {
    console.log('Writing review for booking:', booking);
    navigate('/user/review', { state: { booking } });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_use':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'in_use':
        return <FaPlay className="w-4 h-4" />;
      case 'completed':
        return <FaStar className="w-4 h-4" />;
      case 'cancelled':
        return <FaBan className="w-4 h-4" />;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaBicycle className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Current Bookings</h1>
          <p className="text-xl text-gray-600">Manage your active bike rentals and track your rides</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center animate-scale-in">
            <div className="text-8xl mb-6 animate-float">🚲</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              No Current Bookings
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              You don't have any active bookings at the moment. Start your adventure by booking a bike!
            </p>
            <Link
              to="/bikes"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCalendarAlt className="text-blue-600" />
                        <p className="text-sm text-gray-600">Start Time</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatDate(booking.start_time)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaClock className="text-green-600" />
                        <p className="text-sm text-gray-600">Booked End Time</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatDate(booking.booked_end_time)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaClock className="text-purple-600" />
                        <p className="text-sm text-gray-600">Booked Duration</p>
                      </div>
                      <p className="font-bold text-gray-800">
                        {calculateDuration(booking.start_time, booking.booked_end_time)} hours
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                      <div className="flex items-center gap-3 mb-2">
                        <FaDollarSign className="text-orange-600" />
                        <p className="text-sm text-gray-600">Total Price</p>
                      </div>
                      <p className="font-bold text-blue-600">
                        Rs. {booking.total_price || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {booking.status.toLowerCase() === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStartRide(booking.id)}
                          disabled={actionLoading[booking.id]}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 shadow-lg"
                        >
                          {actionLoading[booking.id] ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <FaPlay className="w-4 h-4" />
                          )}
                          Start Ride
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={actionLoading[booking.id]}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 shadow-lg"
                        >
                          {actionLoading[booking.id] ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <FaTimes className="w-4 h-4" />
                          )}
                          Cancel Booking
                        </button>
                      </>
                    )}
                    
                    {booking.status.toLowerCase() === 'in_use' && (
                      <button
                        onClick={() => handleEndRide(booking.id)}
                        disabled={actionLoading[booking.id]}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 shadow-lg"
                      >
                        {actionLoading[booking.id] ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <FaStop className="w-4 h-4" />
                        )}
                        End Ride
                      </button>
                    )}
                    
                    {booking.status.toLowerCase() === 'completed' && (
                      <button
                        onClick={() => handleWriteReview(booking)}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg"
                      >
                        <FaEdit className="w-4 h-4" />
                        Write Review
                      </button>
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
          <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaShieldAlt className="text-blue-600" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/bikes"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <FaBicycle className="w-4 h-4" />
                Book Another Bike
              </Link>
              <Link
                to="/user/rental-history"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <FaHistory className="w-4 h-4" />
                View History
              </Link>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAction}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          confirmColor={confirmationModal.confirmColor}
          isLoading={actionLoading[confirmationModal.bookingId]}
        />

        {/* Cost Breakdown Modal */}
        {costBreakdownModal.isOpen && costBreakdownModal.data && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-4 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-green-600 text-3xl">✅</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Ride Completed Successfully!</h3>
                <p className="text-sm sm:text-base text-gray-600">Here's your cost breakdown</p>
              </div>

              <div className="space-y-6">
                {/* Cost Breakdown */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaDollarSign className="text-blue-600" />
                    Cost Breakdown
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Booked Duration:</span>
                        <span className="font-semibold text-sm sm:text-base">{costBreakdownModal.data.cost_breakdown.booked_duration_hours} hours</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Actual Ride Time:</span>
                        <span className="font-semibold text-green-600 text-sm sm:text-base">{costBreakdownModal.data.cost_breakdown.actual_duration_hours} hours</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Price per Hour:</span>
                        <span className="font-semibold text-sm sm:text-base">Rs. {costBreakdownModal.data.cost_breakdown.price_per_hour}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Final Duration:</span>
                        <span className="font-semibold text-blue-600 text-sm sm:text-base">{costBreakdownModal.data.cost_breakdown.final_duration_hours} hours</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Pricing Rule:</span>
                        <span className="font-semibold text-purple-600 text-sm sm:text-base">
                          {costBreakdownModal.data.cost_breakdown.pricing_rule === 'booked_duration' ? 'Booked Duration' : 'Actual Duration'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-xl gap-2">
                        <span className="text-sm sm:text-base text-gray-600">Final Cost:</span>
                        <span className="font-semibold text-green-600 text-sm sm:text-base">Rs. {costBreakdownModal.data.cost_breakdown.final_cost}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Final Amount
                  </h4>
                  <div className="text-center">
                    <p className="text-2xl sm:text-4xl font-bold text-green-600 mb-2">
                      Rs. {costBreakdownModal.data.cost_breakdown.final_cost}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">
                      {costBreakdownModal.data.cost_breakdown.pricing_rule === 'booked_duration' 
                        ? 'Charged based on your booked duration'
                        : 'Charged based on your actual ride time'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
                <button
                  onClick={() => {
                    setCostBreakdownModal({ isOpen: false, data: null });
                    fetchBookings();
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base"
                >
                  View Updated Bookings
                </button>
                <button
                  onClick={() => {
                    console.log('Cost breakdown modal data:', costBreakdownModal.data);
                    const bookingData = {
                      id: costBreakdownModal.data.booking_id,
                      bike_id: costBreakdownModal.data.bike_id,
                      bike_name: costBreakdownModal.data.bike_name
                    };
                    console.log('Passing booking data to review:', bookingData);
                    
                    setCostBreakdownModal({ isOpen: false, data: null });
                    navigate('/user/review', { 
                      state: { 
                        fromEndRide: true,
                        redirectTo: '/bikes',
                        booking: bookingData
                      } 
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                >
                  Write Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
