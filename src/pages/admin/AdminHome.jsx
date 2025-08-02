import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { FaStar, FaMoneyBillWave, FaChartLine, FaCheckCircle, FaClock, FaCalendarDay, FaCalendarAlt, FaBicycle, FaClipboardList, FaUsers } from 'react-icons/fa';

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    overall_status: 'Online & Secure',
    status_color: 'emerald',
    status_icon: '🟢'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsRes = await api.get('admin/stats/');
        if (isMounted) {
          setStats(statsRes.data);
        }
        
        // Fetch all users
        const usersRes = await api.get('admin/users/');
        if (isMounted) {
          setAllUsers(usersRes.data || []);
        }
        
        // Fetch system status
        try {
          const statusRes = await api.get('admin/system-status/');
          if (isMounted) {
            setSystemStatus(statusRes.data);
          }
        } catch (statusErr) {
          if (isMounted) {
            console.error('Error fetching system status:', statusErr);
            // Keep default status if fetch fails
          }
        }
        
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data:', err);
          setError('Failed to load data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  // Separate users by role
  const admins = allUsers.filter(user => user.is_staff || user.is_superuser);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-lg">
            <span className="text-emerald-600 text-2xl sm:text-4xl">🚲</span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Welcome back, {user?.username || user?.email}!
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-slate-600 font-medium mb-2">Manage your bike rental system with ease and precision</p>
            <p className="text-xs sm:text-sm lg:text-lg text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 text-slate-500">
            <div className={`w-3 h-3 bg-${systemStatus.status_color}-400 rounded-full animate-pulse shadow-sm`}></div>
            <span className="text-xs sm:text-sm font-medium">
              System Status: {systemStatus.overall_status}
            </span>
          </div>
          {systemStatus.components && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <span>DB: {systemStatus.components.database}</span>
              <span>Server: {systemStatus.components.server}</span>
              {systemStatus.components.errors > 0 && (
                <span className="text-red-500">Errors: {systemStatus.components.errors}</span>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Revenue Summary */}
      <div className="bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/60 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <FaMoneyBillWave className="text-amber-600 text-xl sm:text-2xl" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Revenue Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-6 bg-white rounded-2xl border border-amber-200/50 shadow-lg">
            <p className="text-sm text-amber-600 font-semibold mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-amber-800">Rs. {stats?.total_revenue || 0}</p>
            <p className="text-xs text-slate-500 mt-1">All time earnings</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-green-200/50 shadow-lg">
            <p className="text-sm text-green-600 font-semibold mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-green-800">Rs. {stats?.daily_revenue || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Today's earnings</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-blue-200/50 shadow-lg">
            <p className="text-sm text-blue-600 font-semibold mb-2">Monthly Revenue</p>
            <p className="text-3xl font-bold text-blue-800">Rs. {stats?.monthly_revenue || 0}</p>
            <p className="text-xs text-slate-500 mt-1">This month's earnings</p>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bike Status Breakdown */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200/40 p-6">
            <div className="flex items-center space-x-3">
              <FaBicycle className="text-emerald-600 text-2xl" />
              <h3 className="text-2xl font-bold text-slate-800">Bike Status Overview</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-600" />
                <span className="font-semibold text-green-800">Available</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats?.available_bikes || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3">
                <FaClock className="text-orange-600" />
                <span className="font-semibold text-orange-800">Booked</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{stats?.booked_bikes || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <FaBicycle className="text-blue-600" />
                <span className="font-semibold text-blue-800">In Use</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats?.in_use_bikes || 0}</span>
            </div>

          </div>
        </div>

        {/* Booking Status & Recent Activity */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200/40 p-6">
            <div className="flex items-center space-x-3">
              <FaClipboardList className="text-purple-600 text-2xl" />
              <h3 className="text-2xl font-bold text-slate-800">Booking Status & Activity</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 font-semibold">Pending</p>
                <p className="text-2xl font-bold text-blue-800">{stats?.pending_bookings || 0}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-600 font-semibold">Confirmed</p>
                <p className="text-2xl font-bold text-green-800">{stats?.confirmed_bookings || 0}</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-600 font-semibold">Completed</p>
                <p className="text-2xl font-bold text-emerald-800">{stats?.completed_bookings || 0}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600 font-semibold">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">{stats?.cancelled_bookings || 0}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Recent Bookings (7 days)</span>
                <span className="font-semibold text-slate-800">{stats?.recent_bookings || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">New Users (7 days)</span>
                <span className="font-semibold text-slate-800">{stats?.recent_users || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">New Reviews (7 days)</span>
                <span className="font-semibold text-slate-800">{stats?.recent_reviews || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Admin Management Section */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/40 p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
                <span className="text-blue-600 text-2xl">👨‍💼</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Administrators ({admins.length})
                </h2>
                <p className="text-slate-600 font-medium">Manage system administrators and permissions</p>
              </div>
            </div>
            <Link 
              to="/admin/users" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              ➕ Add New Admin
            </Link>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admins.map(admin => (
              <div key={admin.id} className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-2xl p-6 hover:shadow-lg transition-all duration-500 transform hover:scale-105">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {(admin.username || admin.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{admin.username || admin.email}</p>
                      <p className="text-sm text-slate-600">{admin.email}</p>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-4 py-2 rounded-full font-semibold border border-blue-200/50">
                    Admin
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link 
                    to={`/admin/users`} 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;