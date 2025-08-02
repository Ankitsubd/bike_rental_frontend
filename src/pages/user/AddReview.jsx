import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaBicycle } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';

const AddReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [bike, setBike] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get bike data from location state or URL params
  useEffect(() => {
    console.log('AddReview location.state:', location.state);
    
    if (location.state?.bike) {
      setBike(location.state.bike);
    } else if (location.state?.booking) {
      // If we have booking data, fetch the bike details
      const fetchBikeDetails = async () => {
        try {
          console.log('Booking object:', location.state.booking);
          const bikeId = location.state.booking.bike_id || location.state.booking.bike;
          console.log('Bike ID to fetch:', bikeId);
          
          if (!bikeId) {
            console.error('No bike ID found in booking data');
            setError('No bike ID found in booking data');
            return;
          }
          
          const response = await api.get(`bikes/${bikeId}/`);
          console.log('Bike details fetched:', response.data);
          setBike(response.data);
        } catch (error) {
          console.error('Error fetching bike details:', error);
          setError('Could not load bike details');
        }
      };
      fetchBikeDetails();
    } else {
      console.log('No bike or booking data found in location.state');
      setError('No bike selected for review');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bike) {
      setError('No bike selected for review');
      return;
    }

    if (!reviewData.comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewDataToSend = {
        bike: bike.id,
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      };
      
      console.log('Sending review data:', reviewDataToSend);
      console.log('Bike ID:', bike.id);
      console.log('User:', user);
      
      await api.post('reviews/create/', reviewDataToSend);

      // Navigate based on the source
      if (location.state?.redirectTo) {
        // Redirect to specified page (e.g., bikes page)
        navigate(location.state.redirectTo, { 
          state: { 
            message: 'Review submitted successfully!' 
          } 
        });
      } else {
        // Navigate back to bookings page with success message
        navigate('/user/bookings', { 
          state: { 
            message: location.state?.fromEndRide 
              ? 'Ride completed and review submitted successfully!' 
              : 'Review submitted successfully!',
            fromReview: true 
          } 
        });
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        // Handle non-field errors (like validation errors)
        setError(error.response.data.non_field_errors[0]);
      } else if (error.response?.data) {
        // Log all error data for debugging
        console.error('Full error response:', error.response.data);
        setError('Validation error. Please check your input.');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  if (!bike) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {error ? (
              <div>
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Bike Details</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bike details...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the bike information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user/bookings')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Bookings
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Write a Review</h1>
          <p className="text-gray-600">
            {location.state?.fromEndRide 
              ? "How was your ride? Share your experience with this bike" 
              : "Share your experience with this bike"
            }
          </p>
        </div>

        {/* Bike Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBicycle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{bike.name}</h2>
              <p className="text-gray-600">{bike.brand} - {bike.model}</p>
              <p className="text-sm text-gray-500">Type: {bike.bike_type}</p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl transition-colors ${
                      star <= reviewData.rating 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {reviewData.rating} out of 5 stars
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Your Review
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this bike. What did you like? What could be improved?"
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/user/bookings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReview;
