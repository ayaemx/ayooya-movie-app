import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import "@fontsource/instrument-serif/400.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource-variable/hanken-grotesk"
import "@fontsource/ibm-plex-sans-arabic/400.css"
import "@fontsource/ibm-plex-sans-arabic/500.css"
import "@fontsource/ibm-plex-sans-arabic/600.css"
import { store } from "./app/store.js"
import App from "./App.jsx"
import "./i18n.js"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
