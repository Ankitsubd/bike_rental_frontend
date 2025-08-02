import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import SuccessNotification from '../../components/SuccessNotification';

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer'
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    status: 'all' // all, active, inactive
  });
  
  // Mobile responsive states
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal and notification states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(user => {
        if (filters.role === 'admin') return user.is_staff || user.is_superuser;
        if (filters.role === 'customer') return !user.is_staff && !user.is_superuser;
        return true;
      });
    }

    if (filters.search) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(user => 
        new Date(user.date_joined) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(user => 
        new Date(user.date_joined) <= new Date(filters.dateTo)
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, applyFilters]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('admin/users/');
      setUsers(res.data.results || res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      status: 'all'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form for new user creation
    if (!editingUser) {
      if (!form.username || !form.email || !form.password) {
        setNotification({
          isVisible: true,
          message: 'Please fill in all required fields (Username, Email, and Password)',
          type: 'error'
        });
        return;
      }
      
      if (form.password.length < 6) {
        setNotification({
          isVisible: true,
          message: 'Password must be at least 6 characters long',
          type: 'error'
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Show confirmation modal for updates
    if (editingUser) {
      setConfirmAction(() => async () => {
        try {
          console.log('Updating user with data:', form);
          const response = await api.put(`admin/users/${editingUser.id}/`, form);
          console.log('Update response:', response);
          setNotification({
            isVisible: true,
            message: 'User updated successfully!',
            type: 'success'
          });
          fetchUsers();
          resetForm();
        } catch (err) {
          console.error('Error updating user:', err);
          const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update user';
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
    
    // Create new user directly
    try {
      console.log('Creating new user with data:', form);
      const response = await api.post('admin/users/create/', form);
      console.log('Create response:', response);
      setNotification({
        isVisible: true,
        message: 'User created successfully!',
        type: 'success'
      });
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create user';
      setNotification({
        isVisible: true,
        message: `Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.is_staff || user.is_superuser ? 'admin' : 'customer'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (userId) => {
    setConfirmAction(() => async () => {
      try {
        await api.delete(`admin/users/${userId}/delete/`);
        setNotification({
          isVisible: true,
          message: 'User deleted successfully!',
          type: 'success'
        });
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete user';
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
      username: '',
      email: '',
      password: '',
      role: 'customer'
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/40 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
              <span className="text-blue-600 text-2xl md:text-4xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Manage User
              </h1>
              <p className="text-lg md:text-xl text-blue-600 font-medium">👤 Manage users and their roles</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-medium"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {/* Add New User Button */}
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Add New User
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
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by username or email"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/40 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <p className="text-slate-600">
                {editingUser 
                  ? `Update information for ${editingUser.username || editingUser.email}` 
                  : 'Create a new user account with username, email, and role'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingUser}
                  minLength="6"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
                {editingUser && (
                  <p className="text-xs text-slate-500 mt-1">Leave blank to keep current password</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-6 rounded-2xl border border-slate-200/60">
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-all duration-200">
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        checked={form.role === 'customer'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-700 font-medium">Customer</span>
                        <p className="text-xs text-slate-500">Can book bikes and write reviews</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/50 transition-all duration-200">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={form.role === 'admin'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-700 font-medium">Admin</span>
                        <p className="text-xs text-slate-500">Full system access and management</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isSubmitting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{editingUser ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <span>{editingUser ? 'Update User' : 'Create New User'}</span>
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

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-6">
          {/* Admin Users */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/40 rounded-3xl shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Administrators</h3>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Username</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(user => user.is_staff || user.is_superuser).map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-300">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Admin
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Admins */}
            <div className="md:hidden space-y-4">
              {filteredUsers.filter(user => user.is_staff || user.is_superuser).map(user => (
                <div key={user.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{user.username}</h4>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Admin
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Users */}
          <div className="bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200/40 rounded-3xl shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Customers</h3>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Username</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(user => !user.is_staff && !user.is_superuser).map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-300">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Customer
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Customers */}
            <div className="md:hidden space-y-4">
              {filteredUsers.filter(user => !user.is_staff && !user.is_superuser).map(user => (
                <div key={user.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{user.username}</h4>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Customer
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No users found matching your filters.</p>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => confirmAction && confirmAction()}
        title={editingUser ? "Update User" : "Delete User"}
        message={
          editingUser 
            ? "Are you sure you want to update this user's information? This will modify their account details."
            : "Are you sure you want to delete this user? This action cannot be undone and will permanently remove their account."
        }
        confirmText={editingUser ? "Update User" : "Delete User"}
        cancelText="Cancel"
        type={editingUser ? "warning" : "danger"}
      />
      
      {/* Success/Error Notification */}
      <SuccessNotification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default UserAdmin;
