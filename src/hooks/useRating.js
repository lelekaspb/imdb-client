import { useEffect, useState } from 'react';
import { ratingService } from '../api/ratingService';

export default function useRating(tconst) {
  const [ratingId, setRatingId] = useState(null);
  const [rating, setRating] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  useEffect(() => {
    if (!isLoggedIn) return;

    ratingService.getUserRatings().then(res => {
      const list =
        Array.isArray(res) ? res :
        res?.items ?? res?.ratings ?? [];

      const found = list.find(r => r.tconst === tconst);
      if (found) {
        setRatingId(found.id);
        setRating(found.rating);
      }
    });
  }, [tconst, isLoggedIn]);

  async function save(value) {
    if (!isLoggedIn) throw new Error('Not authenticated');

    if (ratingId) {
      await ratingService.update(ratingId, value);
    } else {
      const res = await ratingService.add(tconst, value);
      setRatingId(res.id);
    }
    setRating(value);
  }

  async function remove() {
    if (!ratingId) return;
    await ratingService.remove(ratingId);
    setRatingId(null);
    setRating(null);
  }

  return { rating, saveRating: save, removeRating: remove, isLoggedIn };
}
