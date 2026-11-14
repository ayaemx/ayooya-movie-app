import { Component } from "react"
import i18n from "../i18n.js"

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Log for developers; users never see stack traces.
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="state" role="alert">
        <h1>{i18n.t("error_title")}</h1>
        <p>{i18n.t("error_body")}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          {i18n.t("retry")}
        </button>
      </div>
    )
  }
}
