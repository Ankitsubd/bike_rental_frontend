import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBicycle, FaShieldAlt, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaStar, FaUsers, FaAward, FaCheckCircle } from 'react-icons/fa';
import api from '../api/axios';

const About = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [adminContact, setAdminContact] = useState({
    email: 'rentbike@gmail.com',
    phone_number: '+977-56-123456',
    full_name: 'Bike Rental Admin',
    location: 'Chitwan, Nepal'
  });

  useEffect(() => {
    // Track page visit
    const trackPageVisit = async () => {
      try {
        await api.post('analytics/track-about-click/', {
          action: 'about_page_visited',
          page: 'about',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // Analytics tracking failed, but don't block the page
        console.warn('Analytics tracking failed (non-critical):', error.message);
      }
    };

    trackPageVisit();

    // Fetch admin contact info
    const fetchAdminContact = async () => {
      try {
        const response = await api.get('admin/contact-info/');
        setAdminContact(response.data);
      } catch (error) {
        console.error('Error fetching admin contact info:', error);
      }
    };

    fetchAdminContact();
  }, []);

  const handleBrowseBikes = async () => {
    setIsLoading(true);
    try {
      // Track the button click in backend
      await api.post('analytics/track-about-click/', {
        action: 'browse_bikes_clicked',
        page: 'about',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Analytics tracking failed, but don't block navigation
      console.warn('Analytics tracking failed (non-critical):', error.message);
    } finally {
      setIsLoading(false);
    }
    
    // Scroll to top and navigate to bikes page
    window.scrollTo(0, 0);
    navigate('/bikes');
  };

  const features = [
    {
      icon: <FaBicycle className="w-8 h-8" />,
      title: "Wide Selection",
      description: "Choose from mountain bikes, city cruisers, electric bikes, and more to match your needs.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Safety First",
      description: "All our bikes undergo regular maintenance and safety checks to ensure your peace of mind.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Our customer support team is available round the clock to assist you with any queries.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const values = [
    {
      icon: <FaHeart className="w-6 h-6" />,
      title: "Customer Satisfaction",
      description: "We prioritize your experience and satisfaction above everything else.",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Safety & Reliability",
      description: "All our bikes are regularly maintained and safety checked for your peace of mind.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <FaStar className="w-6 h-6" />,
      title: "Transparency",
      description: "No hidden fees, clear pricing, and honest communication with our customers.",
      color: "from-yellow-500 to-orange-600"
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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-blue-600/30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <FaBicycle className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">About BikeRental</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-light animate-fade-in">
            We're passionate about making bike rentals accessible, affordable, and enjoyable for everyone. 
            Our mission is to provide quality bikes and exceptional service to help you explore your city with freedom.
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-slide-in-left">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-emerald-200">
              <FaHeart className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Empowering Your Journey</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At BikeRental, we believe that everyone should have access to quality bikes for transportation, 
              recreation, and exploration. Our platform makes bike rentals quick, affordable, and convenient.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you're commuting to work, exploring the city, or enjoying a leisurely ride, 
              our wide range of bikes and reliable service ensure a smooth experience every time.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-in-right">
            <div className="text-6xl mb-6 text-center">🚲</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Us?</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white w-4 h-4" />
                </div>
                <span className="font-medium">Easy online booking system</span>
              </li>
              <li className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white w-4 h-4" />
                </div>
                <span className="font-medium">Competitive pricing with no hidden fees</span>
              </li>
              <li className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white w-4 h-4" />
                </div>
                <span className="font-medium">Regular maintenance and safety checks</span>
              </li>
              <li className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white w-4 h-4" />
                </div>
                <span className="font-medium">24/7 customer support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
              <FaStar className="w-4 h-4" />
              What Makes Us Different
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Our Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experience the best bike rental service with our premium features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group animate-scale-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="animate-slide-in-left">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-200">
              <FaAward className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8">What We Stand For</h2>
            <div className="space-y-6">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <div className="text-white">
                        {value.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl animate-slide-in-right">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaBicycle className="text-white text-2xl" />
            </div>
            <h3 className="text-3xl font-bold mb-6 text-center">Get Started Today</h3>
            <p className="text-emerald-100 mb-8 leading-relaxed text-center">
              Ready to explore your city on two wheels? Join our community of bike enthusiasts and start your journey today.
            </p>
            <button 
              onClick={handleBrowseBikes} 
              className="w-full bg-white text-emerald-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  Loading...
                </>
              ) : (
                <>
                  <FaBicycle className="w-5 h-5" />
                  Browse Bikes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBicycle className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">50+</div>
              <div className="text-gray-600">Bikes Available</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-white text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-indigo-200">
              <FaEnvelope className="w-4 h-4" />
              Get in Touch
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Contact Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">Chitwan, Nepal</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaPhone className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">{adminContact.phone_number}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">{adminContact.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
