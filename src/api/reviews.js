import api from "./axios";

export const createReview = (bikeId ,data) =>
    api.post(`bikes/${bikeId}/reviews/`,data);

export const getReviews = (bikeId)=> api.get(`bikes/${bikeId}/reviews/`);


export const moderateReview = (reviewId,data)=> api.patch(`reviews/${reviewId}/`,data);
