import { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { fetchMe } from "./features/auth/authSlice.js"
import { syncFavorites } from "./features/favorites/favoritesSlice.js"
import { track } from "./lib/analytics.js"
import Navbar from "./components/Navbar.jsx"
import MovieModal from "./components/MovieModel.jsx"
import ChatBot from "./components/ChatBot.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import Home from "./pages/Home.jsx"
import Search from "./pages/Search.jsx"
import Favorites from "./pages/Favorites.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import NotFound from "./pages/NotFound.jsx"

export default function App() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const userId = useSelector((s) => s.auth.user?.id ?? null)
  const authReady = useSelector((s) => s.auth.ready)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  // Load the right list whenever the signed-in user changes (sign in, sign out).
  useEffect(() => {
    if (authReady) dispatch(syncFavorites())
  }, [dispatch, authReady, userId])

  useEffect(() => {
    track("page_view")
  }, [pathname])

  return (
    <ErrorBoundary>
      <a className="skip-link" href="#main">
        {t("skip_to_content")}
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-list" element={<Favorites />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>{t("footer_credit")}</p>
        <p>{t("footer_privacy")}</p>
      </footer>
      <MovieModal />
      <ChatBot />
    </ErrorBoundary>
  )
}
