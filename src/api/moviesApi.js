import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// RTK Query gives caching, de-duplication and loading states for catalogue data.
export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/movies" }),
  keepUnusedDataFor: 600,
  endpoints: (build) => ({
    getList: build.query({
      // kind: trending | popular | top-rated | upcoming
      query: ({ kind, lang }) => ({ url: `/${kind}`, params: { lang } }),
      transformResponse: (r) => r.results,
    }),
    getGenres: build.query({
      query: (lang) => ({ url: "/genres", params: { lang } }),
      transformResponse: (r) => r.genres,
    }),
    discover: build.query({
      query: ({ genre, lang, page = 1 }) => ({ url: "/discover", params: { genre, lang, page } }),
      transformResponse: (r) => r.results,
    }),
    search: build.query({
      query: ({ q, lang, page = 1 }) => ({ url: "/search", params: { q, lang, page } }),
      transformResponse: (r) => r.results,
    }),
    getMovie: build.query({
      query: ({ id, lang }) => ({ url: `/${id}`, params: { lang } }),
    }),
  }),
})

export const { useGetListQuery, useGetGenresQuery, useDiscoverQuery, useSearchQuery, useGetMovieQuery } = moviesApi
