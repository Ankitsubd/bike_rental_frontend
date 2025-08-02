import api from './axios';

export const createBooking = (data) => api.post('bookings/',data);
export const getUserBookings = () => api.get('bookings/');

export const getAllBookings = () => api.get('bookings/');
export const updateBooking = (id,data)=> api.put(`bookings/${id}/`,data);
export const deleteBooking = (id) => api.delete(`bookings/${id}/`); 
export const cancelBooking = async(id)=>{
    return await api.patch(`booking/${id}/cancel/`);
}

// Ride management functions
export const startRide = async (bookingId) => {
    return await api.patch(`booking/${bookingId}/start/`);
};

export const endRide = async (bookingId) => {
    return await api.patch(`booking/${bookingId}/end/`);
};