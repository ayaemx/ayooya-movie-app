// @vitest-environment node
import { describe, expect, it } from "vitest"
import { badgeFor } from "../src/lib/badges.js"

const NOW = Date.parse("2026-11-15")

describe("badgeFor (labels come from real data)", () => {
  it("marks unreleased films as coming soon", () => {
    expect(badgeFor({ release_date: "2026-12-20", vote_average: 0 }, NOW)).toBe("badge_coming_soon")
  })
  it("marks films from the last 45 days as new", () => {
    expect(badgeFor({ release_date: "2026-10-20", vote_average: 6 }, NOW)).toBe("badge_new")
  })
  it("marks older, highly scored films as top rated", () => {
    expect(badgeFor({ release_date: "2017-11-22", vote_average: 8.2 }, NOW)).toBe("badge_top_rated")
  })
  it("leaves everything else unlabelled", () => {
    expect(badgeFor({ release_date: "2015-01-01", vote_average: 6.5 }, NOW)).toBeNull()
    expect(badgeFor({ release_date: null, vote_average: null }, NOW)).toBeNull()
  })
})
