import { createContext } from 'react';

// Provide default values to prevent undefined errors
const defaultContext = {
  user: null,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  loading: true
};

export const AuthContext = createContext(defaultContext); 