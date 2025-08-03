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

// Clean SearchInput component
const SearchInput = ({ initialValue, onSearch, placeholder = "Search bikes..." }) => {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Sync with external value changes only when it's different
  useEffect(() => {
    if (initialValue !== inputValue) {
      setInputValue(initialValue || '');
    }
  }, [initialValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedSearch = useCallback((value) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log('🔍 Search triggered:', value);
      onSearch(value);
    }, 300);
  }, [onSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    console.log('🔍 Input changed:', value);
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('🔍 Search cleared');
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

// Clean Filter component with dropdowns
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-blue-600 text-xl" />
          <h3 className="text-xl font-bold text-gray-800">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            <FaTimes className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bike Type Filter Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Bike Type</label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-300"
            >
              {bikeTypes.map((type) => (
                <option key={type.value} value={type.value} className="flex items-center space-x-3 py-2">
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Filter Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-300"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value} className="flex items-center space-x-3 py-2">
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort Options Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-300"
            >
              {sortOptions.map((sort) => (
                <option key={sort.value} value={sort.value} className="flex items-center space-x-3 py-2">
                  {sort.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clean Pagination component
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
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
      >
        Previous
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
      >
        Next
      </button>
    </div>
  );
};

// Main BikeList component with guaranteed functionality
const BikeList = () => {
  const { bikes: contextBikes, fetchBikes, loading: contextLoading } = useBike();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || '');

  // Clean fetchData function
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('bike_type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('ordering', sortBy);
      params.append('page', currentPage);

      console.log('🔍 Fetching bikes with params:', params.toString());
      const response = await api.get(`bikes/?${params.toString()}`);
      console.log('📦 Response:', response.data);
      
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

  // Initialize from URL on mount
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page') || '1');

    setSearchTerm(search);
    setTypeFilter(type);
    setStatusFilter(status);
    setSortBy(sort);
    setCurrentPage(page);
  }, []); // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (sortBy) params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, typeFilter, statusFilter, sortBy, currentPage, setSearchParams]);

  // Fetch data when filters change
  useEffect(() => {
    console.log('🔄 Filters changed - fetching data:', { searchTerm, typeFilter, statusFilter, sortBy, currentPage });
    fetchData();
  }, [searchTerm, typeFilter, statusFilter, sortBy, currentPage]);

  // Handle search
  const handleSearch = (value) => {
    console.log('🔍 Search term changed:', value);
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log('🎛️ Filter changed:', filterType, value);
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

  // Handle clear filters
  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters');
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('');
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log('📄 Page changed:', page);
    setCurrentPage(page);
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

        {/* Results Section */}
        <div className="mt-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          ) : bikes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No bikes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {bikes.length} {bikes.length === 1 ? 'Bike' : 'Bikes'} Found
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bikes.map((bike) => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BikeList;
