import React from 'react'

import { BrowserRouter as Router} from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContextProvider.jsx';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App /> 
      </AuthProvider>
    </Router>
  </React.StrictMode>
)
