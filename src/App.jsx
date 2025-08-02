
import React, { useEffect } from 'react'
import {ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContextProvider'
import { BikeProvider } from './context/BikeContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css';
const App = () => {
  useEffect(()=>{
    document.title ='Bike Rental System';
  },[]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BikeProvider>
          <ToastContainer position='top-right' autoClose={3000}/>
          <AppRouter/>
        </BikeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}


export default App;
