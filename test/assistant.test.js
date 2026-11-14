// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keywordPlan, sanitizePlan } from "../worker/lib/assistant.js"

describe("sanitizePlan (model output is untrusted)", () => {
  it("drops unknown intents, genres and impossible years", () => {
    const plan = sanitizePlan({
      intent: "delete_users",
      include_genres: ["Comedy", "<script>"],
      exclude_genres: ["Comedy", "Horror"],
      year_from: 99999,
      sort: "x",
    })
    expect(plan.intent).toBe("recommend")
    expect(plan.include).toEqual([35])
    expect(plan.exclude).toEqual([27]) // a genre cannot be both included and excluded
    expect(plan.yearFrom).toBeUndefined()
    expect(plan.sort).toBe("popular")
  })

  it("survives garbage", () => {
    for (const junk of [null, "text", 42, [], { include_genres: "Comedy" }]) {
      expect(sanitizePlan(junk).intent).toBe("recommend")
    }
  })

  it("caps reply length and strips control characters", () => {
    const plan = sanitizePlan({ intent: "chitchat", reply: "a\u0007b".padEnd(900, "x") })
    expect(plan.reply.length).toBe(300)
    expect(plan.reply).not.toContain("\u0007")
  })
})

describe("keywordPlan (fallback when the model is unavailable)", () => {
  it("detects 'like <movie>' requests", () => {
    expect(keywordPlan("something like Interstellar but less sad")).toMatchObject({
      intent: "similar",
      title: "Interstellar",
    })
  })
  it("maps moods to genres in English and Arabic", () => {
    expect(keywordPlan("a funny movie").include).toEqual([35])
    expect(keywordPlan("فيلم رعب").include).toEqual([27])
  })
  it("recognises trending requests", () => {
    expect(keywordPlan("what's trending right now?").intent).toBe("trending")
  })
})
