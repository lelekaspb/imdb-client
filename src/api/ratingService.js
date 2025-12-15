import backend from './backendClient';

export const ratingService = {
  getUserRatings() {
    return backend.get('/Ratings/user');
  },

  add(tconst, rating) {
    return backend.post(`/Ratings/movie/${tconst}`, { rating });
  },

  update(id, rating) {
    return backend.put(`/Ratings/${id}`, { rating });
  },

  remove(id) {
    return backend.delete(`/Ratings/${id}`);
  },
};
