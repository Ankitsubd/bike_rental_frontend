import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { FaEye, FaEdit, FaTrash, FaFilter, FaDownload, FaSearch, FaCalendar, FaUser, FaBicycle, FaMoneyBillWave } from 'react-icons/fa';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    user: '',
    bike: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: ''
  });
  
  // UI states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    if (filters.user) {
      filtered = filtered.filter(booking => 
        booking.user?.username?.toLowerCase().includes(filters.user.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.bike) {
      filtered = filtered.filter(booking => 
        booking.bike?.name?.toLowerCase().includes(filters.bike.toLowerCase()) ||
        (booking.bike?.brand + ' ' + booking.bike?.model)?.toLowerCase().includes(filters.bike.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.start_time) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.start_time) <= new Date(filters.dateTo)
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(booking => 
        booking.total_price >= parseFloat(filters.priceMin)
      );
    }

    if (filters.priceMax) {
      filtered = filtered.filter(booking => 
        booking.total_price <= parseFloat(filters.priceMax)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters, applyFilters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('admin/bookings/');
      setBookings(res.data.results || res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      user: '',
      bike: '',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: ''
    });
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setConfirmAction(() => async () => {
      setIsUpdating(true);
    try {
      await api.patch(`admin/bookings/${bookingId}/update/`, {
        status: newStatus
      });
        await fetchBookings();
        setSuccess(`Booking status updated to ${newStatus} successfully!`);
        setShowConfirmModal(false);
    } catch (err) {
      console.error('Error updating booking:', err);
        setError('Failed to update booking status. Please try again.');
      } finally {
        setIsUpdating(false);
    }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    setConfirmAction(() => async () => {
      setIsDeleting(true);
    try {
      await api.delete(`admin/bookings/${bookingId}/delete/`);
        await fetchBookings();
        setSuccess('Booking deleted successfully!');
        setShowConfirmModal(false);
    } catch (err) {
      console.error('Error deleting booking:', err);
        setError('Failed to delete booking. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/40 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center border border-purple-200/50 shadow-lg">
              <span className="text-purple-600 text-2xl md:text-4xl">📋</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Manage Bookings
              </h1>
              <p className="text-lg md:text-xl text-purple-600 font-medium">👁️ View and manage all bike reservations</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
          <button
              onClick={fetchBookings}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
          >
              <FaSearch className="text-sm" />
              <span>Refresh</span>
          </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
          <button onClick={clearMessages} className="text-red-500 text-sm mt-2 hover:text-red-700">
            Dismiss
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700">{success}</p>
          <button onClick={clearMessages} className="text-green-500 text-sm mt-2 hover:text-green-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FaFilter className="text-purple-600" />
            <h3 className="text-xl font-bold text-slate-800">Advanced Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="bg-gradient-to-r from-slate-500 to-gray-500 text-white px-4 py-2 rounded-xl font-medium hover:from-slate-600 hover:to-gray-600 transition-all duration-300"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FaCalendar className="mr-2 text-purple-600" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FaUser className="mr-2 text-purple-600" />
              User
            </label>
            <input
              type="text"
              placeholder="Search by username or email"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Bike Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FaBicycle className="mr-2 text-purple-600" />
              Bike
            </label>
            <input
              type="text"
              placeholder="Search by bike name"
              value={filters.bike}
              onChange={(e) => handleFilterChange('bike', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2 text-purple-600" />
                Min Price
              </label>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2 text-purple-600" />
                Max Price
              </label>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
      </div>
      
      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
              <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                    <th className="p-4 text-left font-semibold text-slate-800">User</th>
                    <th className="p-4 text-left font-semibold text-slate-800">Bike</th>
                    <th className="p-4 text-left font-semibold text-slate-800">Start Time</th>
                    <th className="p-4 text-left font-semibold text-slate-800">End Time</th>
                    <th className="p-4 text-left font-semibold text-slate-800">Total Price</th>
                    <th className="p-4 text-left font-semibold text-slate-800">Status</th>
                    <th className="p-4 text-left font-semibold text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-slate-800">
                      {booking.user?.username || booking.user?.email || 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-500">{booking.user?.email}</p>
                        </div>
                    </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {booking.bike?.name || `${booking.bike?.brand} ${booking.bike?.model}` || 'Unknown Bike'}
                          </p>
                          <p className="text-sm text-slate-500">{booking.bike?.bike_type}</p>
                        </div>
                    </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-700">{formatDateTime(booking.start_time)}</p>
                    </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-slate-700 font-medium">Booked: {formatDateTime(booking.booked_end_time)}</p>
                          {booking.actual_end_time && (
                            <p className="text-sm text-slate-500">Actual: {formatDateTime(booking.actual_end_time)}</p>
                          )}
                        </div>
                    </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-green-600">Rs. {booking.actual_total_price || booking.total_price}</p>
                          {booking.actual_total_price && booking.total_price !== booking.actual_total_price && (
                            <p className="text-xs text-slate-500">Original: Rs. {booking.total_price}</p>
                          )}
                        </div>
                    </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewBookingDetails(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                          
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Booking"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">
                      {booking.user?.username || booking.user?.email || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      {booking.bike?.name || `${booking.bike?.brand} ${booking.bike?.model}` || 'Unknown Bike'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>Start: {formatDateTime(booking.start_time)}</span>
                      <span>Booked End: {formatDateTime(booking.booked_end_time)}</span>
                    </div>
                    {booking.actual_end_time && (
                      <div className="text-sm text-slate-500 mt-1">
                        <span>Actual End: {formatDateTime(booking.actual_end_time)}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-500 text-sm">Total Price</p>
                    <p className="font-semibold text-green-600 text-lg">Rs. {booking.actual_total_price || booking.total_price}</p>
                    {booking.actual_total_price && booking.total_price !== booking.actual_total_price && (
                      <p className="text-xs text-slate-500">Original: Rs. {booking.total_price}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewBookingDetails(booking)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Booking"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-400 text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Bookings Found</h3>
          <p className="text-slate-500">No bookings match your current filters.</p>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Booking Details</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">User Information</h4>
                    <p className="text-sm text-slate-600">Username: {selectedBooking.user?.username || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Email: {selectedBooking.user?.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Bike Information</h4>
                    <p className="text-sm text-slate-600">Name: {selectedBooking.bike?.name || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Brand: {selectedBooking.bike?.brand || 'N/A'}</p>
                    <p className="text-sm text-slate-600">Model: {selectedBooking.bike?.model || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Booking Times</h4>
                    <p className="text-sm text-slate-600">Start: {formatDateTime(selectedBooking.start_time)}</p>
                    <p className="text-sm text-slate-600">End: {formatDateTime(selectedBooking.end_time)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Payment & Status</h4>
                    <p className="text-sm text-slate-600">Total Price: Rs. {selectedBooking.total_price}</p>
                    <p className="text-sm text-slate-600">Status: 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Booking ID</h4>
                  <p className="text-sm text-slate-600">#{selectedBooking.id}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Action</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to perform this action? This cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUpdating || isDeleting}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isUpdating || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isUpdating || isDeleting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isUpdating ? 'Updating...' : 'Deleting...'}</span>
                    </div>
                  ) : (
                    'Confirm'
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

export default ManageBookings;
