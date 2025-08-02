import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { FaBicycle, FaShieldAlt, FaClock, FaStar, FaArrowRight, FaMapMarkerAlt, FaHeart, FaCheckCircle } from 'react-icons/fa';

const Home = () => {
  const [bikes, setBikes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Memoized data fetching function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [bikesResponse, reviewsResponse] = await Promise.all([
        api.get('bikes/'),
        api.get('reviews/')
      ]);
      
      // Handle both paginated and non-paginated responses
      const bikesData = bikesResponse.data.results || bikesResponse.data || [];
      const availableBikes = bikesData.filter(bike => bike.status === 'available'); 
      setBikes(availableBikes.slice(0, 6)); // Show only 6 bikes on homepage
      
      // Get reviews data
      const reviewsData = reviewsResponse.data.results || reviewsResponse.data || [];
      setReviews(reviewsData.slice(0, 3)); // Show only 3 reviews
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't redirect while auth is loading

    // Redirect admin users to admin dashboard
    if (user && (user.is_staff || user.is_superuser)) {
      navigate('/admin/dashboard');
      return;
    }

    fetchData();
  }, [user, navigate, location.state, authLoading, fetchData]);

  const handleBookNow = useCallback((bikeId) => {
    window.scrollTo(0, 0);
    navigate(`/bikes/${bikeId}`);
  }, [navigate]);

  const handleNavigateToBikes = useCallback(() => {
    window.scrollTo(0, 0);
    navigate('/bikes');
  }, [navigate]);

  // Loading component
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <FaBicycle className="w-10 h-10" />,
      title: "Wide Selection",
      description: "Choose from mountain bikes, city cruisers, electric bikes, and more.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: <FaShieldAlt className="w-10 h-10" />,
      title: "Safe & Reliable",
      description: "All bikes are regularly maintained and safety checked.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: <FaClock className="w-10 h-10" />,
      title: "Instant Booking",
      description: "Book your bike in seconds with our streamlined process.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-1"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delay-2"></div>
      </div>


      
      {/* Professional Hero Section - Google Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center">
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 to-slate-700/30"></div>
        
        {/* Professional Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-amber-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Google Style */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
                <FaMapMarkerAlt className="w-4 h-4 text-emerald-400" />
                <span className="text-white/90 text-sm font-medium">Available in your city</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
                Explore Your City on
                <span className="block bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
                  Two Wheels
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed font-light">
                Rent bikes easily and explore your city with freedom. Choose from our wide variety of bikes, 
                book instantly, and enjoy your ride with our premium service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
                <button
                  onClick={handleNavigateToBikes}
                  className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center gap-3"
                >
                  🚲 Browse Bikes
                  <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                {!user && (
                  <Link
                    to="/register"
                    className="group bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                  >
                    Get Started
                  </Link>
                )}
              </div>
              
              {/* Professional Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-slate-300 text-sm font-medium">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50+</div>
                  <div className="text-slate-300 text-sm font-medium">Bikes Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-slate-300 text-sm font-medium">Support</div>
                </div>
              </div>
            </div>
            
            {/* Professional Right Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Professional Bike Illustration */}
                <div className="w-96 h-96 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="text-8xl animate-bounce">🚴‍♂️</div>
                  </div>
                  
                  {/* Professional Floating Elements */}
                  <div className="absolute top-10 left-10 w-8 h-8 bg-amber-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-20 right-10 w-6 h-6 bg-emerald-400 rounded-full animate-ping delay-500"></div>
                  <div className="absolute top-1/2 right-5 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Features Section */}
      <div className="py-24 bg-white/80 backdrop-blur-xl relative overflow-hidden">
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-emerald-50/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-emerald-200">
              <FaCheckCircle className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 tracking-tight">Why Choose Us?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">Experience the best bike rental service in town with our premium features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 group border border-slate-200 animate-scale-in"
                style={{
                  animationDelay: `${index * 300}ms`
                }}
              >
                <div className={`${feature.iconColor} mb-6 flex justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-slate-900 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 font-light">{feature.description}</p>
                
                {/* Professional Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Bikes Section */}
      <div className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-green-100/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaBicycle className="w-4 h-4" />
              Featured Bikes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Featured Bikes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore our most popular bikes and start your adventure today</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bikes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Unable to Load Bikes</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchData}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          ) : bikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {bikes.map((bike) => (
                <div key={bike.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 group border border-white/20">
                  {bike.image && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Available
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {bike.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{bike.brand} - {bike.model}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Rs. {bike.price_per_hour}/hour</span>
                      <span className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">{bike.bike_type}</span>
                    </div>
                    <button
                      onClick={() => handleBookNow(bike.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚲</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Bikes Available</h3>
              <p className="text-gray-600">Check back later for available bikes</p>
            </div>
          )}
          
          {bikes.length > 0 && (
            <div className="text-center mt-16">
              <button
                onClick={handleNavigateToBikes}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                View All Bikes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="py-24 bg-white/80 backdrop-blur-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FaStar className="w-4 h-4" />
              Customer Reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real reviews from our happy customers who love our service</p>
          </div>
          
          {reviewsLoading ? (
            <div className="flex justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group border border-white/20 animate-scale-in"
                  style={{
                    animationDelay: `${index * 200}ms`
                  }}
                >
                  <div className="flex items-center mb-6">
                    <div className="text-yellow-400 text-xl">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`inline ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic group-hover:text-gray-800 transition-colors duration-300">"{review.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800">{review.user_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
              {user ? (
                <Link
                  to="/user/bookings"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  Book a Bike & Leave a Review
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  Join Us & Share Your Experience
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-green-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to Start Your Adventure?</h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of happy customers who choose us for their bike rental needs. 
            Experience the freedom of exploring your city on two wheels.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleNavigateToBikes}
              className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 flex items-center gap-3"
            >
              Browse Bikes Now
              <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            {!user && (
              <Link
                to="/register"
                className="group bg-transparent border-2 border-white text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-white hover:text-blue-800 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <button
          onClick={handleNavigateToBikes}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          🚲 Book a Bike
        </button>
      </div>
    </div>
  );
};

export default Home;
