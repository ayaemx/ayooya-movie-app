import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // Changed from BrowserRouter
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import App from './App.jsx'
import './index.css'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>,
)
