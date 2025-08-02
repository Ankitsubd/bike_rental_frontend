import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

const BikeContext = createContext();

export { BikeContext };

export const BikeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [bikes, setBikes] = useState([]);
  const [bikeDetails, setBikeDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch all bikes
  const fetchBikes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('bikes/');
      setBikes(response.data.results || response.data);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single bike details
  const fetchBikeDetails = useCallback(async (bikeId) => {
    try {
      const response = await api.get(`bikes/${bikeId}/`);
      setBikeDetails(prev => ({
        ...prev,
        [bikeId]: response.data
      }));
      setLastUpdate(Date.now());
      return response.data;
    } catch (error) {
      console.error('Error fetching bike details:', error);
      throw error;
    }
  }, []);

  // Update bike status in real-time
  const updateBikeStatus = useCallback((bikeId, newStatus) => {
    setBikes(prevBikes => 
      prevBikes.map(bike => 
        bike.id === bikeId 
          ? { ...bike, status: newStatus }
          : bike
      )
    );

    setBikeDetails(prev => ({
      ...prev,
      [bikeId]: prev[bikeId] 
        ? { ...prev[bikeId], status: newStatus }
        : prev[bikeId]
    }));

    setLastUpdate(Date.now());
  }, []);

  // Update bike availability
  const updateBikeAvailability = useCallback((bikeId, isAvailable) => {
    const newStatus = isAvailable ? 'available' : 'booked';
    updateBikeStatus(bikeId, newStatus);
  }, [updateBikeStatus]);

  // Refresh bike data
  const refreshBike = useCallback(async (bikeId) => {
    try {
      await fetchBikeDetails(bikeId);
    } catch (error) {
      console.error('Error refreshing bike:', error);
    }
  }, [fetchBikeDetails]);

  // Refresh all bikes
  const refreshAllBikes = useCallback(async () => {
    try {
      await fetchBikes();
    } catch (error) {
      console.error('Error refreshing all bikes:', error);
    }
  }, [fetchBikes]);

  // Get bike by ID
  const getBikeById = useCallback((bikeId) => {
    return bikeDetails[bikeId] || bikes.find(bike => bike.id === parseInt(bikeId));
  }, [bikeDetails, bikes]);

  // Initial fetch and polling for real-time updates
  useEffect(() => {
    // Only fetch bikes if user is authenticated
    if (user) {
      fetchBikes();
    }
    
    // Polling for real-time updates (every 10 seconds) - only if user is authenticated
    const interval = setInterval(() => {
      if (user && bikes.length > 0) {
        fetchBikes();
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user, bikes.length, fetchBikes]);

  const value = {
    bikes,
    bikeDetails,
    loading,
    lastUpdate,
    fetchBikes,
    fetchBikeDetails,
    updateBikeStatus,
    updateBikeAvailability,
    refreshBike,
    refreshAllBikes,
    getBikeById
  };

  return (
    <BikeContext.Provider value={value}>
      {children}
    </BikeContext.Provider>
  );
}; 