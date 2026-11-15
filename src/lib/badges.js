// Card labels are derived from real catalogue data, never invented:
// a release date in the future, a recent release, or a high audience score.
const DAY = 86_400_000

export function badgeFor(movie, now = Date.now()) {
  const released = movie.release_date ? Date.parse(movie.release_date) : NaN
  if (!Number.isNaN(released)) {
    if (released > now) return "badge_coming_soon"
    if (now - released < 45 * DAY) return "badge_new"
  }
  if (movie.vote_average >= 8) return "badge_top_rated"
  return null
}
