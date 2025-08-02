import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const ModerateReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    rating: '',
    user: '',
    bike: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Mobile responsive states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...reviews];

    if (filters.rating) {
      filtered = filtered.filter(review => review.rating === parseInt(filters.rating));
    }

    if (filters.user) {
      filtered = filtered.filter(review => 
        review.user_name?.toLowerCase().includes(filters.user.toLowerCase()) ||
        review.user?.username?.toLowerCase().includes(filters.user.toLowerCase()) ||
        review.user?.email?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.bike) {
      filtered = filtered.filter(review => 
        review.bike_name?.toLowerCase().includes(filters.bike.toLowerCase()) ||
        review.bike?.name?.toLowerCase().includes(filters.bike.toLowerCase()) ||
        (review.bike?.brand + ' ' + review.bike?.model)?.toLowerCase().includes(filters.bike.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(review => 
        new Date(review.created_at) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(review => 
        new Date(review.created_at) <= new Date(filters.dateTo)
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, filters]);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, filters, applyFilters]);

  const fetchReviews = async () => {
    try {
      const res = await api.get('admin/reviews/');
      setReviews(res.data.results || res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      rating: '',
      user: '',
      bike: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleDeleteReview = (review) => {
    setSelectedReview(review);
    setConfirmAction(() => async () => {
      setIsDeleting(true);
      try {
        await api.delete(`admin/reviews/${review.id}/delete/`);
        setReviews(prev => prev.filter(r => r.id !== review.id));
        setShowConfirmModal(false);
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review');
      } finally {
        setIsDeleting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/40 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center border border-amber-200/50 shadow-lg">
              <span className="text-amber-600 text-2xl md:text-4xl">⭐</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Review Management
              </h1>
              <p className="text-lg md:text-xl text-amber-600 font-medium">⭐ Manage and moderate user reviews</p>
            </div>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className={`bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 md:mb-0">Advanced Filters</h3>
          <button
            onClick={clearFilters}
            className="bg-gradient-to-r from-slate-500 to-gray-500 text-white px-4 py-2 rounded-xl font-medium"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
            <input
              type="text"
              placeholder="Search by username or email"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Bike Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bike</label>
            <input
              type="text"
              placeholder="Search by bike name"
              value={filters.bike}
              onChange={(e) => handleFilterChange('bike', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>
      </div>
      
      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
              {/* Desktop Layout */}
              <div className="hidden md:block">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-lg text-slate-800">
                        {review.user_name || review.user?.username || review.user?.email || 'Anonymous'}
                      </h3>
                      <span className="text-yellow-500 text-lg">{renderStars(review.rating)}</span>
                      <span className="text-sm text-slate-500">({review.rating}/5)</span>
                    </div>
                    <p className="text-slate-600 mb-2">
                      Review for: <span className="font-medium">{review.bike_name || review.bike?.name || review.bike?.brand + ' ' + review.bike?.model || 'N/A'}</span>
                    </p>
                    <p className="text-slate-700">{review.comment}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {review.user_name || review.user?.username || review.user?.email || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {review.bike_name || review.bike?.name || review.bike?.brand + ' ' + review.bike?.model || 'N/A'}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-500">{renderStars(review.rating)}</span>
                      <span className="text-sm text-slate-500">({review.rating}/5)</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-slate-700 text-sm mb-4">{review.comment}</p>
                
                <button
                  onClick={() => handleDeleteReview(review)}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all duration-300"
                >
                  Delete Review
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No reviews found matching your filters.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Review</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              
              {selectedReview && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>User:</strong> {selectedReview.user_name || selectedReview.user?.username || selectedReview.user?.email || 'Anonymous'}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Bike:</strong> {selectedReview.bike_name || selectedReview.bike?.name || selectedReview.bike?.brand + ' ' + selectedReview.bike?.model || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Rating:</strong> {selectedReview.rating}/5
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Comment:</strong> {selectedReview.comment}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Review'
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

export default ModerateReviews;
