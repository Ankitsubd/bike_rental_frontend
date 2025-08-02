import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';

const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logoutWithRedirect = () => {
    logout();
    navigate('/login');
  };

  return { logoutWithRedirect };
};

export default useLogout; 