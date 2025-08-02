import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useBike from '../../hooks/useBike';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaCheckCircle, FaClock, FaBicycle, FaStar, FaArrowLeft, FaInfoCircle, FaCog, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaComments, FaShieldAlt, FaHeart, FaShare, FaBookmark } from 'react-icons/fa';

const BikeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getBikeById, fetchBikeDetails, updateBikeStatus } = useBike();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({ start_time: '', booked_end_time: '' });
  const [message, setMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showBookingRules, setShowBookingRules] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [adminContact, setAdminContact] = useState({
    email: 'rentbike@gmail.com',
    phone_number: '+977 9841234567',
    full_name: 'Bike Rental Admin',
    location: 'Chitwan, Nepal'
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchBikeSafely = async () => {
      try {
        setLoading(true);
        // First try to get from context cache
        let bikeData = getBikeById(id);
        
        if (!bikeData) {
          // If not in cache, fetch from API
          bikeData = await fetchBikeDetails(id);
        }
        
        if (isMounted) {
          setBike(bikeData);
          setIsAvailable(bikeData.status === 'available');
          setError('');
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load bike details.');
          console.error('Error fetching bike:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBikeSafely();

    return () => {
      isMounted = false;
    };
  }, [id, getBikeById, fetchBikeDetails]);

  useEffect(() => {
    if (!bike) return;
    
    let isMounted = true;
    
    const fetchReviewsSafely = async () => {
      try {
        setReviewsLoading(true);
        const response = await api.get(`reviews/?bike=${id}`);
        if (isMounted) {
          setReviews(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching reviews:', error);
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviewsSafely();

    return () => {
      isMounted = false;
    };
  }, [bike, id]);

  // Fetch admin contact info
  useEffect(() => {
    let isMounted = true;
    
    const fetchAdminContact = async () => {
      try {
        const response = await api.get('admin/contact-info/');
        if (isMounted) {
          setAdminContact(response.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching admin contact info:', error);
        }
      }
    };

    fetchAdminContact();

    return () => {
      isMounted = false;
    };
  }, []);



  const getMinDateTime = () => {
    const now = new Date();
    const bufferTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const localDateTime = new Date(bufferTime.getTime() - bufferTime.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const now = new Date();
    const maxTime = new Date(now.getTime() + 36 * 60 * 60 * 1000); // 36 hours from now
    const localDateTime = new Date(maxTime.getTime() - maxTime.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('Please login to book a bike.');
      return;
    }

    if (!bookingData.start_time || !bookingData.booked_end_time) {
      setMessage('Please select both start time and end time.');
      return;
    }

    const startDate = new Date(bookingData.start_time);
    const endDate = new Date(bookingData.booked_end_time);
    const now = new Date();
    const bufferTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    
    if (startDate < bufferTime) {
      setMessage('Start time cannot be more than 5 minutes in the past.');
      return;
    }

    if (endDate <= startDate) {
      setMessage('End time must be after start time.');
      return;
    }

    // Show booking rules modal
    setShowBookingRules(true);
    return;
  };

  const handleConfirmBooking = async () => {
    setShowBookingRules(false);
    
    try {
      await api.post('book/', { 
        bike: id, 
        start_time: bookingData.start_time,
        booked_end_time: bookingData.booked_end_time
      });
      setBookingData({ start_time: '', booked_end_time: '' });
      
      // Update bike status in real-time
      updateBikeStatus(id, 'booked');
      setIsAvailable(false);
      
      // Navigate directly to bookings page after successful booking
      navigate('/user/bookings');
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage('This bike is already booked for the selected time period. Please choose a different time or bike.');
      } else {
        setMessage('Booking failed: ' + (err.response?.data?.error || 'Try again later.'));
      }
    }
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'available': {
        label: 'Available',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <FaCheckCircle className="w-5 h-5" />,
        badgeColor: 'bg-green-100 text-green-800',
        pulse: 'animate-pulse'
      },
      'booked': {
        label: 'Booked',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <FaClock className="w-5 h-5" />,
        badgeColor: 'bg-orange-100 text-orange-800',
        pulse: ''
      },
      'in_use': {
        label: 'In Use',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <FaBicycle className="w-5 h-5" />,
        badgeColor: 'bg-blue-100 text-blue-800',
        pulse: 'animate-bounce'
      }
    };
    return configs[status] || configs['available'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/bikes"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Bikes
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(bike.status);
  const isAvailableForBooking = isAvailable;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-all duration-300 transform hover:scale-105 hover:bg-blue-50 px-4 py-2 rounded-xl"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Bikes
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{bike.name}</h1>
              <p className="text-xl text-gray-600 font-medium">
                {bike.brand} • {bike.model}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300">
                <FaShare className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300">
                <FaBookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Image and Description */}
          <div className="xl:col-span-2 space-y-6">
            {/* Enhanced Bike Image */}
            <div className="relative group">
              {bike.image ? (
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img 
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                </div>
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <FaBicycle className="w-32 h-32 text-blue-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                </div>
              )}

              {/* Enhanced Status Badge */}
              <div className={`absolute top-6 right-6 px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-3 ${statusConfig.badgeColor} backdrop-blur-sm transition-all duration-300 group-hover:scale-110 shadow-xl z-20 ${statusConfig.pulse}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>

              {/* Enhanced Price Badge */}
              <div className="absolute top-6 left-6 px-6 py-3 rounded-full text-lg font-bold bg-white/95 backdrop-blur-sm text-blue-600 shadow-xl transition-all duration-300 group-hover:scale-110 z-20">
                Rs. {bike.price_per_hour}/hr
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 backdrop-blur-sm shadow-xl z-20">
                <div className="flex items-center gap-2">
                  <FaStar className="w-4 h-4" />
                  4.5
                </div>
              </div>
            </div>

            {/* Bike Description */}
            {bike.description && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaInfoCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">About This Bike</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{bike.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="flex gap-3 mb-8 overflow-x-auto">
                {[
                  { key: 'details', label: 'Details', icon: <FaInfoCircle className="w-4 h-4" /> },
                  { key: 'specs', label: 'Specifications', icon: <FaCog className="w-4 h-4" /> },
                  { key: 'reviews', label: 'Reviews', icon: <FaComments className="w-4 h-4" /> },
                  { key: 'contact', label: 'Contact', icon: <FaPhone className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Enhanced Status Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <FaShieldAlt className="w-5 h-5 text-blue-600" />
                      Status Information
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-lg">Current Status:</span>
                      <div className="flex items-center gap-3">
                        <div className="transition-all duration-300 hover:scale-110">
                          {statusConfig.icon}
                        </div>
                        <span className={`font-bold text-lg ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Specifications */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                      <FaCog className="w-5 h-5 text-green-600" />
                      Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                        <FaBicycle className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Brand</span>
                          <p className="font-semibold text-gray-800">{bike.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                        <FaCog className="w-5 h-5 text-green-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Model</span>
                          <p className="font-semibold text-gray-800">{bike.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                        <FaInfoCircle className="w-5 h-5 text-purple-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Type</span>
                          <p className="font-semibold text-gray-800">{bike.bike_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                        <FaDollarSign className="w-5 h-5 text-yellow-600" />
                        <div>
                          <span className="text-gray-600 text-sm">Price</span>
                          <p className="font-semibold text-gray-800">Rs. {bike.price_per_hour}/hr</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaShieldAlt className="w-4 h-4 text-blue-600" />
                        Performance
                      </h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          High-quality frame construction
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          Smooth gear shifting
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          Responsive braking system
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHeart className="w-4 h-4 text-green-600" />
                        Features
                      </h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          Comfortable seating
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          Adjustable handlebars
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          LED lighting system
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FaPhone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Phone</span>
                        <p className="font-semibold text-gray-800 text-lg">{adminContact.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="p-3 bg-green-100 rounded-full">
                        <FaEnvelope className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Email</span>
                        <p className="font-semibold text-gray-800 text-lg">{adminContact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <FaMapMarkerAlt className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Location</span>
                        <p className="font-semibold text-gray-800 text-lg">{adminContact.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <FaInfoCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Admin</span>
                        <p className="font-semibold text-gray-800 text-lg">{adminContact.full_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <FaComments className="w-5 h-5 text-blue-600" />
                      Customer Reviews
                    </h3>
                    <div className="flex items-center gap-2">
                      <FaStar className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">4.5</span>
                      <span className="text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  </div>
                  
                  {reviewsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-lg">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {review.user_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-lg">{review.user_name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`w-5 h-5 ${
                                    index < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-lg">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No reviews yet. Be the first to review this bike!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Book This Bike</h3>
                <p className="text-gray-600">Select your preferred time and book instantly</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.start_time}
                    onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                    min={getMinDateTime()}
                    max={getMaxDateTime()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.booked_end_time}
                    onChange={(e) => setBookingData({ ...bookingData, booked_end_time: e.target.value })}
                    min={bookingData.start_time || getMinDateTime()}
                    max={getMaxDateTime()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {message && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAvailableForBooking}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isAvailableForBooking
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAvailableForBooking ? 'Book Now' : 'Not Available'}
                </button>


              </form>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price per hour:</span>
                    <span className="font-semibold text-gray-800">Rs. {bike.price_per_hour}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      <FaStar className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-800">4.5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Rules Modal */}
      {showBookingRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Booking Rules</h3>
                <button
                  onClick={() => setShowBookingRules(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Minimum Booking</h4>
                    <p className="text-gray-600 text-sm">Minimum 1 hour charge for any ride</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Time Rounding</h4>
                    <p className="text-gray-600 text-sm">1h 10m = 1h • 1h 11m = 2h</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Early End</h4>
                    <p className="text-gray-600 text-sm">If you end before booked time: pay for booked duration</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Late End</h4>
                    <p className="text-gray-600 text-sm">If you end after booked time: pay for actual duration</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleConfirmBooking}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => navigate('/user/bookings')}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => setShowBookingRules(false)}
                  className="w-full px-4 py-3 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default BikeDetail;
