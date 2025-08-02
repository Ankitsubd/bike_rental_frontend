import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCheckCircle, 
    FaClock, 
    FaBicycle, 
    FaStar, 
    FaHeart, 
    FaShare, 
    FaEye, 
    FaTimes, 
    FaMapMarkerAlt, 
    FaCalendarAlt,
    FaShieldAlt,
    FaBolt,
    FaLeaf,
    FaRoad,
    FaMountain,
    FaCity,
    FaArrowRight,
    FaCheck
} from 'react-icons/fa';
import api from '../api/axios';

const BikeCard = ({ bike }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const isAvailable = bike.status === 'available';

    const getStatusConfig = (status) => {
        const configs = {
            'available': {
                label: 'Available Now',
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                icon: <FaCheckCircle className="w-4 h-4" />,
                badgeColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                pulse: 'animate-pulse',
                description: 'Ready to rent',
                accentColor: 'emerald'
            },
            'booked': {
                label: 'Currently Booked',
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                icon: <FaClock className="w-4 h-4" />,
                badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
                pulse: '',
                description: 'Booked by another user',
                accentColor: 'amber'
            },
            'in_use': {
                label: 'In Use',
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-200',
                icon: <FaBicycle className="w-4 h-4" />,
                badgeColor: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
                pulse: 'animate-bounce',
                description: 'Currently being used',
                accentColor: 'indigo'
            }
        };
        return configs[status] || configs['available'];
    };

    const getBikeTypeIcon = (bikeType) => {
        const icons = {
            'mountain': <FaMountain className="w-4 h-4" />,
            'city': <FaCity className="w-4 h-4" />,
            'electric': <FaBolt className="w-4 h-4" />,
            'road': <FaRoad className="w-4 h-4" />,
            'hybrid': <FaLeaf className="w-4 h-4" />
        };
        return icons[bikeType?.toLowerCase()] || <FaBicycle className="w-4 h-4" />;
    };

    const getBikeTypeColor = (bikeType) => {
        const colors = {
            'mountain': 'from-orange-500 to-red-500',
            'city': 'from-blue-500 to-cyan-500',
            'electric': 'from-purple-500 to-pink-500',
            'road': 'from-emerald-500 to-teal-500',
            'hybrid': 'from-teal-500 to-blue-500'
        };
        return colors[bikeType?.toLowerCase()] || 'from-slate-500 to-slate-600';
    };

    const fetchReviews = useCallback(async () => {
        if (!bike.id) return;
        
        try {
            setLoadingReviews(true);
            const response = await api.get(`reviews/?bike=${bike.id}`);
            console.log('Reviews API response:', response.data);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    }, [bike.id]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const statusConfig = getStatusConfig(bike.status);
    const isAvailableForBooking = isAvailable;
    const bikeTypeIcon = getBikeTypeIcon(bike.bike_type);
    const bikeTypeColor = getBikeTypeColor(bike.bike_type);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : bike.rating || 4.5;

    const handleReviewClick = () => {
        setShowReviewsModal(true);
    };

    const closeReviewsModal = () => {
        setShowReviewsModal(false);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageLoaded(false);
    };

    return (
        <>
            <div 
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 ${
                    isAvailableForBooking ? 'border border-emerald-200 hover:border-emerald-300' : 'border border-slate-200 hover:border-slate-300'
                } bg-white animate-fade-in`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    animationDelay: `${Math.random() * 500}ms`
                }}
            >
                {/* Professional Image Section */}
                <div className="relative overflow-hidden">
                    {bike.image ? (
                        <div className="relative">
                            <img 
                                src={bike.image}
                                alt={bike.name}
                                className={`w-full h-48 sm:h-56 lg:h-64 object-cover transition-all duration-700 ${
                                    isHovered ? 'scale-110' : 'scale-100'
                                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                            />
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-600/20 transition-opacity duration-500 ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                            }`}></div>
                            <FaBicycle className={`w-20 h-20 text-slate-400 transition-all duration-500 ${
                                isHovered ? 'scale-125 rotate-12' : 'scale-100'
                            }`} />
                        </div>
                    )}
                    
                    {/* Professional Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusConfig.badgeColor} backdrop-blur-sm transition-all duration-300 z-20 ${
                        isHovered ? 'scale-110 shadow-lg' : 'scale-100'
                    } ${statusConfig.pulse}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                    </div>

                    {/* Professional Price Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-bold bg-white/95 backdrop-blur-sm text-slate-700 shadow-lg transition-all duration-300 z-20 ${
                        isHovered ? 'scale-110 shadow-xl' : 'scale-100'
                    }`}>
                        <span className="text-lg">₹{bike.price_per_hour}</span>
                        <span className="text-xs">/hr</span>
                    </div>

                    {/* Professional Rating Badge */}
                    <div 
                        className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 backdrop-blur-sm shadow-lg z-20 flex items-center gap-1.5 cursor-pointer hover:bg-amber-200 transition-colors duration-300"
                        onClick={handleReviewClick}
                    >
                        <FaStar className="w-4 h-4 text-amber-500" />
                        {averageRating}
                        <span className="text-xs">({reviews.length})</span>
                    </div>

                    {/* Professional Quick Action Buttons */}
                    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 transition-all duration-500 z-30 ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                setIsLiked(!isLiked);
                            }}
                            className={`p-2 rounded-full transition-all duration-300 ${
                                isLiked ? 'bg-red-500 text-white' : 'bg-white/95 text-slate-600'
                            } hover:scale-110 shadow-lg backdrop-blur-sm`}
                            title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <FaHeart className="w-4 h-4" />
                        </button>
                        <button 
                            className="p-2 rounded-full bg-white/95 text-slate-600 hover:scale-110 shadow-lg transition-all duration-300 backdrop-blur-sm"
                            title="Share this bike"
                        >
                            <FaShare className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Professional Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500 z-10 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                </div>

                {/* Bike Description - Right below image */}
                {bike.description && (
                    <div className="p-3 bg-blue-50 border-b border-blue-100">
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                            {bike.description}
                        </p>
                    </div>
                )}

                {/* Professional Content Section */}
                <div className="p-4 sm:p-6 relative">
                    {/* Professional Bike Info */}
                    <div className="mb-4">
                        <h3 className={`text-lg font-bold mb-2 line-clamp-1 transition-all duration-300 ${
                            isHovered ? 'text-slate-800' : 'text-slate-700'
                        }`}>{bike.name}</h3>
                        <p className="text-slate-600 mb-3 flex items-center gap-2 text-sm">
                            <FaBicycle className="w-4 h-4 text-slate-500" />
                            {bike.brand} - {bike.model}
                        </p>
                        
                        {/* Professional Bike Type Badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${bikeTypeColor} text-white text-xs font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-md`}>
                                {bikeTypeIcon}
                                {bike.bike_type}
                            </span>
                            <div className="flex items-center gap-1">
                                <FaStar className="w-3 h-3 text-amber-400" />
                                <span className="text-xs text-slate-600">{averageRating} ({reviews.length} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Features Section */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <FaShieldAlt className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs text-emerald-700 font-medium">Safety Checked</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <FaBolt className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-700 font-medium">Instant Booking</span>
                        </div>
                    </div>

                    {/* Professional Reviews Section */}
                    {reviews.length > 0 && (
                        <div 
                            className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors duration-300"
                            onClick={handleReviewClick}
                        >
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <FaEye className="w-3 h-3" />
                                Recent Reviews
                            </h4>
                            <div className="space-y-2">
                                {reviews.slice(0, 2).map((review, index) => (
                                    <div key={review.id || index} className="flex items-start gap-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar 
                                                    key={i} 
                                                    className={`w-3 h-3 ${i < review.rating ? 'text-amber-400' : 'text-slate-300'}`} 
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 flex-1">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                                View all reviews
                                <FaEye className="w-3 h-3" />
                            </div>
                        </div>
                    )}

                    {/* Professional Status Information */}
                    <div className={`mb-4 p-3 rounded-xl border transition-all duration-300 ${
                        isHovered ? 'bg-white shadow-md' : 'bg-slate-50'
                    } border-slate-200`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Status:</span>
                            <div className="flex items-center gap-2">
                                <div className={`transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                                    {statusConfig.icon}
                                </div>
                                <span className={`text-sm font-semibold ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{statusConfig.description}</p>
                    </div>

                    {/* Professional Action Button */}
                    <Link 
                        to={`/bikes/${bike.id}`}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                            isAvailableForBooking
                                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black shadow-lg hover:shadow-xl'
                                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                        {isAvailableForBooking ? (
                            <>
                                <span>View Details & Book</span>
                                <FaArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <span>Currently Unavailable</span>
                        )}
                    </Link>

                    {/* Professional Floating Elements */}
                    <div className={`absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500 ${
                        isHovered ? 'scale-150 opacity-20' : 'scale-100 opacity-0'
                    }`}></div>
                    <div className={`absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500 delay-100 ${
                        isHovered ? 'scale-150 opacity-20' : 'scale-100 opacity-0'
                    }`}></div>
                </div>
            </div>

            {/* Professional Reviews Modal */}
            {showReviewsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* Professional Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                                    <FaStar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{bike.name} Reviews</h3>
                                    <p className="text-sm text-slate-600">{reviews.length} reviews • {averageRating} average rating</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeReviewsModal}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
                            >
                                <FaTimes className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Professional Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review, index) => (
                                        <div key={review.id || index} className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar 
                                                                key={i} 
                                                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-300'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 block">
                                                        by {review.user_name || 'Anonymous'}
                                                    </span>
                                                    {review.created_at && (
                                                        <span className="text-xs text-slate-400 block">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaStar className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No reviews yet for this bike.</p>
                                    <p className="text-sm text-slate-400 mt-1">Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>

                        {/* Professional Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <button 
                                onClick={closeReviewsModal}
                                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 px-6 rounded-xl font-medium hover:from-slate-900 hover:to-black transition-all duration-200 transform hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BikeCard;