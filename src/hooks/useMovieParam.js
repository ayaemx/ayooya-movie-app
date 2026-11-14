import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

/** The open movie lives in the URL (?movie=ID), so details are shareable and Back closes them. */
export function useMovieParam() {
  const [params, setParams] = useSearchParams()
  const raw = Number(params.get("movie"))
  const id = Number.isInteger(raw) && raw > 0 ? raw : null

  const open = useCallback(
    (movieId) =>
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("movie", String(movieId))
        return next
      }),
    [setParams],
  )
  const close = useCallback(
    () =>
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("movie")
        return next
      }),
    [setParams],
  )
  return { id, open, close }
}
