import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

// Create a review
export async function createReview(ratedUserId, transportRequestId, rating, comment = "") {
  return await axios.post(`${API_URL}/create`, {
    ratedUserId,
    transportRequestId,
    rating,
    comment,
    ratedById: JSON.parse(localStorage.getItem("user") || "{}")._id,
  });
}

// Get reviews for a user
export async function getUserReviews(userId) {
  return await axios.get(`${API_URL}/user/${userId}`);
}

// Check if user can rate
export async function canRate(userId, targetUserId, requestId) {
  return await axios.get(`${API_URL}/canRate`, {
    params: { userId, targetUserId, requestId },
  });
}

// Delete a review
export async function deleteReview(reviewId) {
  return await axios.delete(`${API_URL}/${reviewId}`);
}
