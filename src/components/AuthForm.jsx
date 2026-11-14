import { useId, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { login, register } from "../features/auth/authSlice.js"
import { track } from "../lib/analytics.js"
import { EyeIcon, EyeOffIcon } from "./Icons.jsx"

const KNOWN_ERRORS = [
  "invalid_credentials",
  "email_taken",
  "weak_password",
  "invalid_email",
  "invalid_name",
  "rate_limited",
]

export default function AuthForm({ mode }) {
  const isRegister = mode === "register"
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const uid = useId()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (isRegister && form.password.length < 10) return setError(t("err_weak_password"))
    setBusy(true)
    const action = isRegister ? register(form) : login({ email: form.email, password: form.password })
    const result = await dispatch(action)
    setBusy(false)
    if (result.error) {
      const code = result.payload?.code
      return setError(t(KNOWN_ERRORS.includes(code) ? `err_${code}` : "err_generic"))
    }
    track(isRegister ? "signup" : "login")
    navigate("/", { replace: true })
  }

  return (
    <div className="auth">
      <title>{`${t(isRegister ? "register" : "sign_in")} — Ayooya`}</title>
      <form className="auth-card" onSubmit={onSubmit} noValidate={false}>
        <h1>{t(isRegister ? "register_title" : "sign_in_title")}</h1>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {isRegister && (
          <div className="field">
            <label htmlFor={`${uid}-name`}>{t("name")}</label>
            <input
              id={`${uid}-name`}
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              required
              minLength={2}
              maxLength={60}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor={`${uid}-email`}>{t("email")}</label>
          <input
            id={`${uid}-email`}
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            required
            maxLength={254}
            dir="ltr"
          />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-password`}>{t("password")}</label>
          <div className="password-wrap">
            <input
              id={`${uid}-password`}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 10 : 1}
              maxLength={128}
              aria-describedby={isRegister ? `${uid}-hint` : undefined}
              dir="ltr"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={t(showPassword ? "hide_password" : "show_password")}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          {isRegister && (
            <p id={`${uid}-hint`} className="hint">
              {t("password_hint")}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {t(isRegister ? "register" : "sign_in")}
        </button>
        <p className="auth-switch">
          {t(isRegister ? "have_account" : "no_account")}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{t(isRegister ? "sign_in" : "register")}</Link>
        </p>
      </form>
    </div>
  )
}
