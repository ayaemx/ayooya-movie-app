# Security notes and threat model

Ayooya v2 was rebuilt with security as a first-class feature. This document
explains what could go wrong, what was wrong in v1, and what v2 does about it.
Every control marked ✅ is covered by an automated test in `test/`.

## Architecture

```
Browser (React SPA)
   │  same-origin HTTPS, HttpOnly session cookie
   ▼
Cloudflare Worker  ──►  TMDB API        (key stored as a Worker secret)
   │               ──►  Workers AI      (LLM, no secrets, no tools)
   └──────────────►   D1 database      (users, sessions, favorites, counters)
```

Trust boundaries: (1) browser → Worker, (2) Worker → TMDB, (3) Worker → LLM.
Anything crossing a boundary is validated on the Worker side.

## What changed from v1

| Risk in v1                                                                                       | v2 control                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| TMDB API key committed in `.env` and shipped inside the JavaScript bundle — anyone could copy it | Key is a Worker secret; the browser only calls `/api/*`. CI fails if a key pattern appears in the bundle ✅                   |
| "Login" compared against a hard-coded email/password in client code                              | Real accounts: PBKDF2-SHA256 (100,000 iterations, per-user salt), server-side sessions ✅                                     |
| No session handling                                                                              | Random 256-bit token in an `HttpOnly; Secure; SameSite=Lax` cookie with the `__Host-` prefix; only its SHA-256 is stored ✅   |
| Browser called a third-party API directly with user input                                        | Allow-listed endpoints and validated parameters only; upstream error bodies are never forwarded ✅                            |
| No security headers                                                                              | Strict CSP (`script-src 'self'`, no inline script or style), HSTS, `nosniff`, frame denial, referrer and permissions policies |
| No tests, lint broken, known-vulnerable packages                                                 | 35 tests, lint + a11y rules, `npm audit` and a secret scan on every push, Dependabot                                          |

## Threats and mitigations (STRIDE-style)

**Credential attacks (spoofing)**

- Brute force / credential stuffing → rate limits per IP _and_ per targeted email ✅
- Account enumeration → identical error for unknown email and wrong password, and the same hashing work is done either way ✅
- Weak passwords → 10-character minimum (length over composition rules, per NIST SP 800-63B)

**Session attacks**

- XSS stealing the session → cookie is `HttpOnly`; CSP blocks injected scripts
- CSRF → `SameSite=Lax` + `Origin` check + JSON-only request bodies ✅
- Stolen database → session tokens and rate-limit keys are stored hashed ✅

**Tampering / injection**

- SQL injection → every query uses bound parameters
- Stored XSS via favorites → fields validated on write (e.g. image paths must match a strict pattern) ✅; React escapes on render
- Parameter tampering on TMDB calls → genre ids, page numbers and movie ids are validated against allow-lists ✅

**Broken access control**

- Reading or editing another user's list → every query is scoped by the user id from the session, never from the request ✅
- Analytics report → requires an admin token, compared in constant time ✅

**LLM-specific risks (OWASP Top 10 for LLM Applications)**

- _Prompt injection_ → the model has no secrets and no tools. It can only emit a small JSON plan; the Worker decides which allow-listed TMDB query to run ✅
- _Insecure output handling_ → model output is treated as untrusted: intents and genres are checked against enums, years are range-checked, text is length-capped and stripped of control characters, and the UI renders it as plain text ✅
- _Hallucinated content_ → the assistant can only return movie ids that the Worker itself fetched from TMDB; invented ids are dropped ✅
- _Denial of wallet_ → per-visitor and global daily caps on chat requests; input and history size limits ✅
- _Availability_ → if the model fails, a keyword planner answers instead ✅

**Information disclosure**

- Errors return a generic message; details go to server logs only
- API responses are `no-store`; only public catalogue data is cached
- Analytics are cookieless and aggregate-only (event name + day + A/B variant). No IPs, ids or free text are stored, and Do Not Track / Global Privacy Control are honoured

## Known limitations (honest list)

- **The v1 TMDB key is still in git history.** Removing the file does not un-leak it; the key must be rotated in the TMDB dashboard.
- PBKDF2 at 100k iterations is the platform ceiling on Workers; Argon2id would be stronger but is not available natively.
- No email verification, password reset or MFA yet.
- The D1-backed rate limiter is a fixed window; a determined attacker can burst at window edges.
- Dev-only tooling (the local Workers emulator) currently pulls in packages flagged by `npm audit`; nothing flagged ships to users (`npm audit --omit=dev` is clean).
- The assistant is tested against a scripted model and the keyword fallback; prompt quality with the live model should be reviewed after the first deploy.

## Reporting a vulnerability

Please open a private security advisory on the GitHub repository rather than a public issue.
