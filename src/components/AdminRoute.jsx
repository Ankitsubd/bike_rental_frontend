// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const auth = useAuth();
  const { user = null } = auth || {};
  return (user?.is_staff || user?.is_superuser) ? children : <Navigate to="/unauthorized" />;
};

export default AdminRoute;
