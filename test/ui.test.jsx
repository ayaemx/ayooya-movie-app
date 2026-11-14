import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import "../src/i18n.js"
import { makeStore } from "../src/app/store.js"
import { setChatOpen } from "../src/features/ui/uiSlice.js"
import { toggleFavorite } from "../src/features/favorites/favoritesSlice.js"
import ChatBot from "../src/components/ChatBot.jsx"
import AuthForm from "../src/components/AuthForm.jsx"
import MovieCard from "../src/components/MovieCard.jsx"

const movie = { id: 7, title: "Test Movie", poster_path: "/p.jpg", vote_average: 8.1, release_date: "2021-05-01" }
const jsonResponse = (data, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }))

function renderWith(ui, store = makeStore()) {
  render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  )
  return store
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    "fetch",
    vi.fn(() => jsonResponse({})),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("ChatBot", () => {
  it("sends the message to the API and shows the picks with their reasons", async () => {
    fetch.mockImplementation(() =>
      jsonResponse({ reply: "Try these:", movies: [{ ...movie, reason: "Smart and hopeful." }], source: "ai" }),
    )
    const store = makeStore()
    store.dispatch(setChatOpen(true))
    renderWith(<ChatBot />, store)

    await userEvent.type(screen.getByLabelText("What do you feel like watching?"), "space but happy{Enter}")

    expect(await screen.findByText("Test Movie")).toBeInTheDocument()
    expect(screen.getByText("Smart and hopeful.")).toBeInTheDocument()
    const [url, init] = fetch.mock.calls.at(-1)
    expect(url).toBe("/api/chat")
    expect(JSON.parse(init.body)).toMatchObject({ message: "space but happy", lang: "en" })
  })

  it("renders a malicious reply as inert text, never as HTML", async () => {
    fetch.mockImplementation(() =>
      jsonResponse({ reply: '<img src=x onerror="alert(1)"><script>steal()</script>', movies: [] }),
    )
    const store = makeStore()
    store.dispatch(setChatOpen(true))
    renderWith(<ChatBot />, store)

    await userEvent.type(screen.getByLabelText("What do you feel like watching?"), "hello there{Enter}")

    expect(await screen.findByText(/<img src=x/)).toBeInTheDocument()
    expect(document.querySelector(".chat img, .chat script")).toBeNull()
  })

  it("shows a friendly message when rate-limited", async () => {
    fetch.mockImplementation(() => jsonResponse({ error: { code: "rate_limited", message: "slow down" } }, 429))
    const store = makeStore()
    store.dispatch(setChatOpen(true))
    renderWith(<ChatBot />, store)
    await userEvent.type(screen.getByLabelText("What do you feel like watching?"), "anything good{Enter}")
    expect(await screen.findByText(/Give me a minute/)).toBeInTheDocument()
  })
})

describe("My List", () => {
  it("keeps a guest's list in this browser across reloads", async () => {
    const store = makeStore()
    await store.dispatch(toggleFavorite(movie))
    expect(JSON.parse(localStorage.getItem("ayooya:list"))).toHaveLength(1)
    expect(makeStore().getState().favorites.items[0].title).toBe("Test Movie") // a fresh page load
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining("/api/favorites"), expect.anything())
  })

  it("exposes the add/remove state to assistive technology", async () => {
    renderWith(<MovieCard movie={movie} />)
    const button = screen.getByRole("button", { name: "Add to My List: Test Movie" })
    expect(button).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(button)
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Remove from My List: Test Movie" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    )
  })
})

describe("AuthForm", () => {
  it("rejects short passwords before calling the server", async () => {
    renderWith(<AuthForm mode="register" />)
    await userEvent.type(screen.getByLabelText("Name"), "Aya")
    await userEvent.type(screen.getByLabelText("Email"), "aya@example.com")
    await userEvent.type(screen.getByLabelText("Password"), "short")
    await userEvent.click(screen.getByRole("button", { name: "Create account" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("at least 10 characters")
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows the server's generic error on a failed sign-in", async () => {
    fetch.mockImplementation(() => jsonResponse({ error: { code: "invalid_credentials", message: "x" } }, 401))
    renderWith(<AuthForm mode="login" />)
    await userEvent.type(screen.getByLabelText("Email"), "aya@example.com")
    await userEvent.type(screen.getByLabelText("Password"), "wrong password")
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.")
  })
})
