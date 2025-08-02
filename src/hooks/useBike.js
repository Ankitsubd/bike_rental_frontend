import { useContext } from 'react';
import { BikeContext } from '../context/BikeContext';

const useBike = () => {
  const context = useContext(BikeContext);
  if (!context) {
    throw new Error('useBike must be used within a BikeProvider');
  }
  return context;
};

export default useBike; 