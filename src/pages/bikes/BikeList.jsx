import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useBike from '../../hooks/useBike';
import api from '../../api/axios';
import BikeCard from '../../components/BikeCard';
import Spinner from '../../components/Spinner';
import apiCache, { CACHE_KEYS } from '../../utils/cache';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaSort, 
  FaCheckCircle, 
  FaClock, 
  FaBicycle, 
  FaMotorcycle,
  FaBolt,
  FaMountain,
  FaRoad,
  FaCity,
  FaCog,
  FaShieldAlt
} from 'react-icons/fa';

// Modern SearchInput with enhanced UX
const SearchInput = ({ initialValue, onSearch, placeholder = "Search bikes..." }) => {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialValue !== inputValue) {
      setInputValue(initialValue || '');
    }
  }, [initialValue, inputValue]);

  const debouncedSearch = useCallback((value) => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [onSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1 group">
      <div className="relative">
        <input
          ref={inputRef}
          type='text'
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          className='w-full px-6 py-4 pl-14 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg text-lg'
        />
        <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300 group-hover:text-blue-500 text-lg" />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Modern Filter component with icons and better UX
const FilterSection = ({ typeFilter, statusFilter, sortBy, onFilterChange, onClearFilters, hasActiveFilters }) => {
  const bikeTypes = [
    { value: "", label: "All Types", icon: <FaBicycle className="w-4 h-4" /> },
    { value: "Mountain", label: "Mountain", icon: <FaMountain className="w-4 h-4" /> },
    { value: "City ride", label: "City Ride", icon: <FaCity className="w-4 h-4" /> },
    { value: "Road", label: "Road", icon: <FaRoad className="w-4 h-4" /> },
    { value: "Hybrid", label: "Hybrid", icon: <FaBicycle className="w-4 h-4" /> },
    { value: "Electric", label: "Electric", icon: <FaBolt className="w-4 h-4" /> },
    { value: "BMX", label: "BMX", icon: <FaMotorcycle className="w-4 h-4" /> }
  ];

  const statusOptions = [
    { value: "", label: "All Status", icon: <FaCog className="w-4 h-4" /> },
    { value: "available", label: "Available", icon: <FaCheckCircle className="w-4 h-4 text-green-600" /> },
    { value: "booked", label: "Booked", icon: <FaClock className="w-4 h-4 text-orange-600" /> },
    { value: "in_use", label: "In Use", icon: <FaBicycle className="w-4 h-4 text-blue-600" /> }
  ];

  const sortOptions = [
    { value: "", label: "Sort By" },
    { value: "price_per_hour", label: "Price: Low to High" },
    { value: "-price_per_hour", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
    { value: "-name", label: "Name: Z to A" },
    { value: "added_on", label: "Newest First" },
    { value: "-added_on", label: "Oldest First" }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaFilter className="w-6 h-6 text-blue-600" />
            Filters & Sort
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <FaTimes className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Bike Type</label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/80 backdrop-blur-sm"
            >
              {bikeTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaSort className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Status</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/80 backdrop-blur-sm"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaSort className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Sort By</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/80 backdrop-blur-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaSort className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Pagination with better UX
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
      >
        Previous
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
            page === currentPage
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg'
              : page === '...'
              ? 'border-gray-200 text-gray-500 cursor-default'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
      >
        Next
      </button>
    </div>
  );
};

const BikeList = () => {
  const { bikes: contextBikes, fetchBikes, loading: contextLoading } = useBike();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('bike_type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('ordering', sortBy);
      params.append('page', currentPage);

      const response = await api.get(`bikes/?${params.toString()}`);
      setBikes(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 12));
      setError('');
    } catch (error) {
      setError('Failed to load bikes.');
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Refresh bikes when component mounts to get latest status
    if (!searchTerm && !typeFilter && !statusFilter && !sortBy && currentPage === 1) {
      fetchBikes();
    }
    
    // Refresh when user returns to the tab
    const handleFocus = () => {
      if (!searchTerm && !typeFilter && !statusFilter && !sortBy && currentPage === 1) {
        fetchBikes();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBikes, searchTerm, typeFilter, statusFilter, sortBy, currentPage]);

  // Use context bikes for real-time updates when no filters are applied
  useEffect(() => {
    if (!searchTerm && !typeFilter && !statusFilter && !sortBy && currentPage === 1) {
      // Use context bikes for real-time updates
      setBikes(contextBikes);
      setLoading(contextLoading);
      setTotalPages(Math.ceil((contextBikes.length) / 12));
    }
  }, [contextBikes, contextLoading, searchTerm, typeFilter, statusFilter, sortBy, currentPage]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDataSafely = async () => {
      try {
        setLoading(true);
        
        // Create cache key based on filters
        const cacheKey = `${CACHE_KEYS.BIKES}_${searchTerm}_${typeFilter}_${statusFilter}_${sortBy}_${currentPage}`;
        
        // Check cache first
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && !searchTerm && !typeFilter && !statusFilter) {
          if (isMounted) {
            setBikes(cachedData.results || cachedData);
            setTotalPages(Math.ceil((cachedData.count || cachedData.length) / 12));
            setError('');
            setLoading(false);
          }
          return;
        }
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (typeFilter) params.append('bike_type', typeFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (sortBy) params.append('ordering', sortBy);
        params.append('page', currentPage);

        const response = await api.get(`bikes/?${params.toString()}`);
        
        if (isMounted) {
          setBikes(response.data.results || response.data);
          setTotalPages(Math.ceil((response.data.count || response.data.length) / 12));
          setError('');
          
          // Cache the response if no filters applied
          if (!searchTerm && !typeFilter && !statusFilter) {
            apiCache.set(cacheKey, response.data);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load bikes. Please try again later.');
          console.error('Error fetching bikes:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDataSafely();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm, typeFilter, statusFilter, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchTerm, typeFilter, statusFilter, sortBy, setSearchParams]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'type':
        setTypeFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || typeFilter || statusFilter || sortBy;

  if (loading && bikes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Bikes</h2>
          <p className="text-gray-600">Finding the perfect rides for you...</p>
        </div>
      </div>
    );
  }

  if (error && bikes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl mb-6 animate-bounce">🚲</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={fetchData}
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaBicycle className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Explore Our Bikes
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the perfect bike for your next adventure. From mountain trails to city streets, we have something for every rider.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <SearchInput 
              initialValue={searchTerm}
              onSearch={handleSearch}
              placeholder="Search by name, brand, type, or features..."
            />
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <FilterSection
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Enhanced Bike Grid */}
        {bikes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-float">🚲</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Bikes Found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {bikes.map((bike, index) => (
              <div
                key={bike.id}
                className="animate-scale-in transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <BikeCard bike={bike} />
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BikeList;
