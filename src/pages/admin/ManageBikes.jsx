import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import SuccessNotification from '../../components/SuccessNotification';

const ManageBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    bike_type: '',
    price_per_hour: '',
    description: '',
    image: null
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    bike_type: '',
    status: '',
    priceMin: '',
    priceMax: '',
    search: ''
  });
  
  // Mobile responsive states
  const [showFilters, setShowFilters] = useState(false);

  // Confirmation modal and notification states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...bikes];

    if (filters.bike_type) {
      filtered = filtered.filter(bike => bike.bike_type === filters.bike_type);
    }

    if (filters.status) {
      filtered = filtered.filter(bike => bike.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(bike => 
        bike.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
        bike.model?.toLowerCase().includes(filters.search.toLowerCase()) ||
        bike.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(bike => 
        bike.price_per_hour >= parseFloat(filters.priceMin)
      );
    }

    if (filters.priceMax) {
      filtered = filtered.filter(bike => 
        bike.price_per_hour <= parseFloat(filters.priceMax)
      );
    }

    setFilteredBikes(filtered);
  }, [bikes, filters]);

  useEffect(() => {
    fetchBikes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bikes, filters, applyFilters]);

  const fetchBikes = async () => {
    try {
      const res = await api.get('admin/bikes/');
      setBikes(res.data.results || res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching bikes:', err);
      setError('Failed to load bikes.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      bike_type: '',
      status: '',
      priceMin: '',
      priceMax: '',
      search: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form for new bike creation
    if (!editingBike) {
      if (!form.name || !form.brand || !form.model || !form.bike_type || !form.price_per_hour || !form.image) {
        setNotification({
          isVisible: true,
          message: 'Please fill in all required fields (Name, Brand, Model, Bike Type, Price, and Bike Image)',
          type: 'error'
        });
        return;
      }
      
      // Validate price is a positive number
      if (isNaN(form.price_per_hour) || parseFloat(form.price_per_hour) <= 0) {
        setNotification({
          isVisible: true,
          message: 'Please enter a valid price (must be a positive number)',
          type: 'error'
        });
        return;
      }
      
      // Validate image is required for new bikes
      if (!form.image || !(form.image instanceof File)) {
        setNotification({
          isVisible: true,
          message: 'Please select a bike image (required for new bikes)',
          type: 'error'
        });
        return;
      }
      
      // Validate image file
      if (form.image.size > 5 * 1024 * 1024) {
        setNotification({
          isVisible: true,
          message: 'Image file size must be less than 5MB',
          type: 'error'
        });
        return;
      }
      if (!form.image.type.startsWith('image/')) {
        setNotification({
          isVisible: true,
          message: 'Please select a valid image file (JPG, PNG, GIF)',
          type: 'error'
        });
        return;
      }
    } else {
      // Validate form for bike updates
      if (!form.name || !form.brand || !form.model || !form.bike_type || !form.price_per_hour) {
        setNotification({
          isVisible: true,
          message: 'Please fill in all required fields (Name, Brand, Model, Bike Type, and Price)',
          type: 'error'
        });
        return;
      }
      
      // Validate price is a positive number
      if (isNaN(form.price_per_hour) || parseFloat(form.price_per_hour) <= 0) {
        setNotification({
          isVisible: true,
          message: 'Please enter a valid price (must be a positive number)',
          type: 'error'
        });
        return;
      }
      
      // Validate image file if provided for updates
      if (form.image && form.image instanceof File) {
        if (form.image.size > 5 * 1024 * 1024) {
          setNotification({
            isVisible: true,
            message: 'Image file size must be less than 5MB',
            type: 'error'
          });
          return;
        }
        if (!form.image.type.startsWith('image/')) {
          setNotification({
            isVisible: true,
            message: 'Please select a valid image file (JPG, PNG, GIF)',
            type: 'error'
          });
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    // Show confirmation modal for updates
    if (editingBike) {
      setConfirmAction(() => async () => {
        try {
          console.log('Updating bike with data:', form);
          const formData = new FormData();
          
          // Add all form fields to FormData
          Object.keys(form).forEach(key => {
            if (form[key] !== null && form[key] !== '') {
              if (key === 'image' && form[key] instanceof File) {
                formData.append(key, form[key]);
              } else if (key !== 'image') {
                formData.append(key, form[key]);
              }
            }
          });
          
          // Smart image handling: only include image if a new one is selected
          if (form.image && form.image instanceof File) {
            formData.append('image', form.image);
          }
          // If no new image, don't include image field - backend will keep old image
          
          const response = await api.put(`admin/bikes/${editingBike.id}/`, formData);
          console.log('Update response:', response);
          
          setNotification({
            isVisible: true,
            message: 'Bike updated successfully!',
            type: 'success'
          });
          fetchBikes();
          resetForm();
        } catch (err) {
          console.error('Error updating bike:', err);
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update bike';
          setNotification({
            isVisible: true,
            message: `Error: ${errorMessage}`,
            type: 'error'
          });
        } finally {
          setIsSubmitting(false);
        }
        setShowConfirmModal(false);
      });
      setShowConfirmModal(true);
      setIsSubmitting(false);
      return;
    }
    
    // Show confirmation modal for new bike creation
    setConfirmAction(() => async () => {
      try {
        console.log('Creating new bike with data:', form);
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(form).forEach(key => {
          if (key === 'image') {
            // Handle image field specifically
            if (form[key] instanceof File) {
              // Validate image file before sending
              if (form[key].size > 5 * 1024 * 1024) { // 5MB limit
                throw new Error('Image file size must be less than 5MB');
              }
              if (!form[key].type.startsWith('image/')) {
                throw new Error('Please select a valid image file (JPG, PNG, etc.)');
              }
              formData.append(key, form[key]);
            }
          } else if (form[key] !== null && form[key] !== '') {
            // Handle non-image fields
            formData.append(key, form[key]);
          }
        });
        
        // Add default values for required fields that might be missing
        if (!formData.has('status')) {
          formData.append('status', 'available');
        }
        if (!formData.has('phone_number')) {
          formData.append('phone_number', '');
        }
        
        // Check if image is included
        if (!formData.has('image')) {
          console.error('No image found in FormData!');
          throw new Error('Bike image is required. Please select an image file.');
        }
        
        const response = await api.post('admin/bikes/', formData);
        console.log('Create response:', response);
        
        setNotification({
          isVisible: true,
          message: 'Bike created successfully!',
          type: 'success'
        });
        fetchBikes();
        resetForm();
      } catch (err) {
        console.error('Error creating bike:', err);
        console.error('Error response:', err.response?.data);
        
        let errorMessage = 'Failed to create bike';
        
        // Handle specific error types
        if (err.message && err.message.includes('Image file size')) {
          errorMessage = err.message;
        } else if (err.message && err.message.includes('valid image file')) {
          errorMessage = err.message;
        } else if (err.response?.data?.image) {
          // Handle array of image errors
          if (Array.isArray(err.response.data.image)) {
            errorMessage = err.response.data.image[0];
          } else {
            errorMessage = 'Please select a valid bike image (JPG, PNG, GIF). Image should be less than 5MB.';
          }
        } else if (err.response?.data?.name) {
          errorMessage = 'Please provide a valid bike name.';
        } else if (err.response?.data?.brand) {
          errorMessage = 'Please provide a valid brand name.';
        } else if (err.response?.data?.model) {
          errorMessage = 'Please provide a valid model name.';
        } else if (err.response?.data?.bike_type) {
          errorMessage = 'Please select a valid bike type.';
        } else if (err.response?.data?.price_per_hour) {
          errorMessage = 'Please provide a valid price (must be a positive number).';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        
        setNotification({
          isVisible: true,
          message: errorMessage,
          type: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
    setIsSubmitting(false);
  };

  const handleEdit = (bike) => {
    setEditingBike(bike);
    setForm({
      name: bike.name || '',
      brand: bike.brand || '',
      model: bike.model || '',
      bike_type: bike.bike_type || '',
      price_per_hour: bike.price_per_hour || '',
      description: bike.description || '',
      image: null
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (bikeId) => {
    setConfirmAction(() => async () => {
      try {
        await api.delete(`admin/bikes/${bikeId}/`);
        setNotification({
          isVisible: true,
          message: 'Bike deleted successfully!',
          type: 'success'
        });
        fetchBikes();
      } catch (err) {
        console.error('Error deleting bike:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete bike';
        setNotification({
          isVisible: true,
          message: `Error: ${errorMessage}`,
          type: 'error'
        });
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      brand: '',
      model: '',
      bike_type: '',
      price_per_hour: '',
      description: '',
      image: null
    });
    setEditingBike(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200/40 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-lg">
              <span className="text-emerald-600 text-2xl md:text-4xl">🚲</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Manage Bike
              </h1>
              <p className="text-lg md:text-xl text-emerald-600 font-medium">🚲 Manage bikes and inventory</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {/* Add New Bike Button */}
            <button
              onClick={() => {
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Add New Bike
            </button>
          </div>
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
          {/* Bike Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bike Type</label>
            <select
              value={filters.bike_type}
              onChange={(e) => handleFilterChange('bike_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="Mountain">Mountain</option>
              <option value="City ride">City ride</option>
              <option value="Road">Road</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="BMX">BMX</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="in_use">In Use</option>
              <option value="returned">Returned</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="reserved">Reserved</option>
              <option value="offline">Offline / Inactive</option>
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by brand, model, or description"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            Showing {filteredBikes.length} of {bikes.length} bikes
          </p>
        </div>
      </div>

      {/* Add/Edit Bike Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-200/40 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 text-xl">📝</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {editingBike ? 'Edit Bike' : 'Add New Bike'}
              </h3>
              <p className="text-slate-600">
                {editingBike ? 'Update bike information' : 'Add a new bike to inventory'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter bike name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  placeholder="Enter brand name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  required
                  placeholder="Enter model name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bike Type *</label>
                <select
                  name="bike_type"
                  value={form.bike_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Select Type</option>
                  <option value="Mountain">Mountain</option>
                  <option value="City ride">City ride</option>
                  <option value="Road">Road</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                  <option value="BMX">BMX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price per Hour (Rs.) *</label>
                <input
                  type="number"
                  name="price_per_hour"
                  value={form.price_per_hour}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Enter bike description (optional)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bike Image {editingBike ? '(Optional)' : '*'}
              </label>
              
              {/* Show current image if editing */}
              {editingBike && bikes.find(bike => bike.id === editingBike.id)?.image && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-2">Current image:</p>
                  <img
                    src={bikes.find(bike => bike.id === editingBike.id)?.image}
                    alt="Current bike image"
                    className="w-32 h-24 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
              
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                required={!editingBike}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                {editingBike 
                  ? 'Leave empty to keep current image. JPG, PNG, GIF. Max size: 5MB'
                  : 'Required: JPG, PNG, GIF. Max size: 5MB'
                }
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isSubmitting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{editingBike ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <span>{editingBike ? 'Update Bike' : 'Add Bike'}</span>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className={`px-6 py-3 border border-slate-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                  isSubmitting 
                    ? 'text-slate-400 cursor-not-allowed' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bikes List */}
      {filteredBikes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBikes.map(bike => (
            <div key={bike.id} className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {bike.image && (
                <img
                  src={bike.image}
                  alt={`${bike.brand} ${bike.model}`}
                  className="w-full h-48 object-cover rounded-xl mb-4 shadow-md"
                />
              )}
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-800">
                  {bike.brand} {bike.model}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {bike.bike_type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bike.status === 'available' ? 'bg-green-100 text-green-800' :
                    bike.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                    bike.status === 'in_use' ? 'bg-purple-100 text-purple-800' :
                    bike.status === 'returned' ? 'bg-emerald-100 text-emerald-800' :
                    bike.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    bike.status === 'reserved' ? 'bg-orange-100 text-orange-800' :
                    bike.status === 'offline' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bike.status}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-2">
                  {bike.description || 'No description available'}
                </p>
                
                <div className="text-2xl font-bold text-emerald-600">
                  Rs. {bike.price_per_hour}/hr
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(bike)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bike.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No bikes found matching your filters.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title={
          editingBike 
            ? "Update Bike" 
            : showForm && !editingBike 
              ? "Add New Bike" 
              : "Delete Bike"
        }
        message={
          editingBike 
            ? "Do you want to update this bike? Are you sure?"
            : showForm && !editingBike 
              ? "Are you sure you want to add this new bike to the inventory? Please review the details before confirming."
              : "Are you sure you want to delete this bike? This action cannot be undone."
        }
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />

      {/* Success/Error Notification */}
      <SuccessNotification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
};

export default ManageBikes;
