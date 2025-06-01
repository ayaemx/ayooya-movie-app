export async function fetchGenres(apiKey) {
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`)
  const data = await res.json()
  return data.genres // <--- This is the important part!
}
