import backend from "./backendClient";

export const noteService = {
  // All notes for logged-in user
  getMyNotes: () => backend.get("/Notes/user"),

  // Notes for a specific movie
  getMovieNotes: (tconst) =>
    backend.get(`/Notes/movie/${tconst}`),

  // Notes for a specific person
  getPersonNotes: (nconst) =>
    backend.get(`/Notes/person/${nconst}`),

  // Create
  createForMovie: (tconst, content) =>
    backend.post(`/Notes/movie/${tconst}`, { content }),

  createForPerson: (nconst, content) =>
    backend.post(`/Notes/person/${nconst}`, { content }),

  // Update
  update: (noteId, content) =>
    backend.put(`/Notes/${noteId}`, { content }),

  // Delete
  remove: (noteId) =>
    backend.delete(`/Notes/${noteId}`),
};
