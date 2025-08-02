import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsRes = await api.get('admin/stats/');
        setStats(statsRes.data);
        
        // Fetch recent bookings with expanded user and bike data
        const bookingsRes = await api.get('admin/bookings/?page_size=10');
        setRecentBookings(bookingsRes.data.results || bookingsRes.data || []);
        
        // Fetch all users
        const usersRes = await api.get('admin/users/');
        setAllUsers(usersRes.data || []);
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  // Separate users by role
  const admins = allUsers.filter(user => user.is_staff || user.is_superuser);
  const customers = allUsers.filter(user => !user.is_staff && !user.is_superuser);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-3xl shadow-xl p-10">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-lg">
            <span className="text-emerald-600 text-4xl">🚲</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-slate-600 font-medium mb-2">Comprehensive insights and performance metrics</p>
            <p className="text-lg text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        {/* Current Admin Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/40 rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200/50 shadow-lg">
              <span className="text-blue-600 text-xl">👨‍💼</span>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Current Administrator</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Username</p>
              <p className="text-lg font-bold text-slate-800">{user?.username || 'N/A'}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Email</p>
              <p className="text-lg font-bold text-slate-800">{user?.email || 'N/A'}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Role</p>
              <p className="text-lg font-bold text-blue-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/40 text-slate-900 p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Total Users</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats?.total_users || 0}</p>
              <p className="text-sm text-slate-500 mt-1">
                {stats?.customer_users || 0} customers, {stats?.admin_users || 0} admins
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
              <span className="text-blue-600 text-3xl">👥</span>
            </div>
          </div>
        </div>
        
        {/* Total Bikes Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/40 text-slate-900 p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Total Bikes</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats?.total_bikes || 0}</p>
              <p className="text-sm text-slate-500 mt-1">
                {stats?.available_bikes || 0} available
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-lg">
              <span className="text-emerald-600 text-3xl">🚲</span>
            </div>
          </div>
        </div>
        
        {/* Total Bookings Card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/40 text-slate-900 p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Total Bookings</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{stats?.total_bookings || 0}</p>
              <p className="text-sm text-slate-500 mt-1">
                {stats?.completed_bookings || 0} completed
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center border border-purple-200/50 shadow-lg">
              <span className="text-purple-600 text-3xl">📋</span>
            </div>
          </div>
        </div>
        
        {/* Total Reviews Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/40 text-slate-900 p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">Total Reviews</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stats?.total_reviews || 0}</p>
              <p className="text-sm text-slate-500 mt-1">
                Avg. Rating: {stats?.avg_rating || 0}/5
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center border border-amber-200/50 shadow-lg">
              <span className="text-amber-600 text-3xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Admins */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">👨‍💼 Administrators ({admins.length})</h2>
            <Link to="/admin/users" className="text-blue-600 hover:underline">Manage All</Link>
          </div>
          <div className="space-y-2">
            {admins.slice(0, 5).map(admin => (
              <div key={admin.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <div>
                  <p className="font-semibold">{admin.username || admin.email}</p>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </div>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Admin</span>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-gray-500 text-center py-4">No administrators found</p>
            )}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800">👥 Customers ({customers.length})</h2>
            <Link to="/admin/users" className="text-green-600 hover:underline">Manage All</Link>
          </div>
          <div className="space-y-2">
            {customers.slice(0, 5).map(customer => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <div>
                  <p className="font-semibold">{customer.username || customer.email}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Customer</span>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No customers found</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📋 Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-blue-600 hover:underline">View All</Link>
        </div>
        
        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Bike</th>
                  <th className="text-left p-2">Start Time</th>
                  <th className="text-left p-2">End Time</th>
                  <th className="text-left p-2">Total Price</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {booking.user?.username || booking.user?.email || 'Unknown User'}
                    </td>
                    <td className="p-2">
                      {booking.bike?.name || booking.bike?.brand + ' ' + booking.bike?.model || 'Unknown Bike'}
                    </td>
                    <td className="p-2">
                      {new Date(booking.start_time).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {new Date(booking.end_time).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      Rs. {booking.total_price}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
