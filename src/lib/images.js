const BASE = "https://image.tmdb.org/t/p"

export const posterUrl = (path, size = "w342") => (path ? `${BASE}/${size}${path}` : null)
export const posterSrcSet = (path) =>
  path ? `${BASE}/w185${path} 185w, ${BASE}/w342${path} 342w, ${BASE}/w500${path} 500w` : undefined
export const backdropUrl = (path, size = "w1280") => (path ? `${BASE}/${size}${path}` : null)
export const backdropSrcSet = (path) => (path ? `${BASE}/w780${path} 780w, ${BASE}/w1280${path} 1280w` : undefined)
export const yearOf = (movie) => (movie?.release_date ? movie.release_date.slice(0, 4) : "")
