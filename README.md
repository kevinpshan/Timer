# Meeting Tools (TMTools)

### A PWA for Toastmasters Clubs · Southern Dutchess Toastmasters

Meeting Tools is a Progressive Web App built to run the working roles at a Toastmasters meeting — Timer, Ah-Counter, and Club Tools — from a phone or tablet without installing anything from an app store. It started as a single-file HTML tool and has grown into a full multi-club, cloud-synced platform with AI-powered speech analysis and participation tracking.

**Live app:** [kevinpshan.github.io/TMTools](https://kevinpshan.github.io/TMTools)

-----

## What It Does

### Timer

Full-screen color cues for standard meeting roles. The background transitions from green to yellow to red at configurable thresholds. Presets cover Table Topics (1–2m), Evaluations (2–3m), Ice Breaker (4–6m), and Speeches (5–7m), with a custom mode for anything else. Reset, Pause/Resume, and Commit & Exit round out the controls. Every timed session is saved to the meeting report with the speaker name, role, and final time.

### Ah-Counter

Tap-to-count tally cards for tracking filler words — AH, UH, UM, ER, SO, LIKE, YOU KNOW — plus the Word of the Day. Cards can be added on the fly during a live session. If the same speaker is saved twice in one meeting the counts merge automatically. Sessions 15 seconds or longer get an estimated filler score (EXCELLENT / GOOD / NEEDS WORK) based on elapsed time at 130 words per minute.

### Speech Recording & Transcription

Record a speaker directly in the app, transcribe via **OpenAI Whisper**, and get filler words highlighted automatically in the result — red for fillers, gold for the Word of the Day. The transcript includes a filler score (under 5% = Excellent, 5–10% = Good, over 10% = Needs Work), can be shared directly to email, Messages, or Slack, and is saved for the duration of the meeting.

### Word of the Day

Powered by **ChatGPT (GPT-4o-mini)**. Pick from a library of over 1,000 sophisticated words or search any word for a custom public-speaking-flavored definition and usage sentence. Selecting a word pins it to the top of the Ah-Counter grid with a gold badge and highlights it in gold during transcription. The selected word is also written to Firestore so it appears at the top of the Cloud Meeting Report on every device.

### Meeting Report

Two-tab report screen. **This Device** shows sessions recorded locally in the standard Name | Role | Result format. **☁ Cloud** queries Firestore for every session recorded across all club devices today, split into timing and counter sections, with a refresh button for meetings still in progress. Copy and Share work on whichever tab is active.

### Progress Tracking

Per-speaker filler rate history stored in Firestore across meetings. Each speaker shows their latest rate, trend indicator (↑ improving / ↓ worsening / → steady), and session count. Tap any speaker for the full session log with dates, scores, and who recorded each session. Individual sessions can be deleted if entered in error.

### PACE Participation Tracker

Club participation tracking system aligned to the Toastmasters year (July 1 – June 30). Members earn points for each role they fill at a meeting. The leaderboard shows ranked standings with progress bars toward the 100-point annual goal, color-coded by achievement level. Officers enter meeting roles after each meeting; the data syncs to all club devices via Firestore.

Key features: role-based point accumulation with configurable values, member history drill-down, 5-year archive, Role Manager for customizing point values, and embeddable widgets for your club website (ranked list and bar chart, one line of HTML to embed).

-----

## Multi-Club Cloud Sync

Clubs are identified by an 8-character sync code (format: `XXXX-XXXX`). The officer generates the code once — it creates a Firestore document that stores the club’s roster, filler words, AI key, and PACE roles. Members join by entering the code on first launch; roster and settings download automatically. From that point forward the app auto-syncs on every open.

Multiple clubs can be managed on a single device. All data is scoped per club — logs, speakers, fillers, API key, custom timer thresholds, PACE roles. A built-in **TEST CLUB** is always available for demos; it never writes to Firestore.

-----

## Tech Stack

|Layer             |Technology                                              |
|------------------|--------------------------------------------------------|
|App               |Single-file HTML/CSS/JS — no build step, no dependencies|
|Hosting           |GitHub Pages                                            |
|Database          |Firebase Firestore                                      |
|AI — Definitions  |OpenAI GPT-4o-mini                                      |
|AI — Transcription|OpenAI Whisper                                          |
|Installable       |PWA with service worker and manifest                    |

The entire app ships as one HTML file. There are no npm packages, no bundler, no framework. This was a deliberate choice to eliminate external dependency failures and keep the codebase maintainable by a single person with AI assistance.

-----

## Installation (PWA)

On iOS: open the app in Safari, tap **Share → Add to Home Screen**. On Android: tap the browser menu and select **Install App**. The app works fully offline after first load — the service worker caches all assets.

-----

## Repository Structure

index.html              Main app (entire codebase)
sw.js                   Service worker — cache versioning and offline support
manifest.json           PWA manifest — icons, theme, display mode
pace-widget.js          Embeddable PACE leaderboard/chart widget for external websites
manual.html             User manual (Members + Officers & Devs tabs)
changelog.html          Release history and roadmap (Released | Roadmap tabs)
technical-reference.html  Architecture, Firestore schema, function reference
test-plan.html          Test cases across 15+ sections
dev/                    Active development environment (dev_ localStorage prefix)
test/                   Beta validation environment (test_ localStorage prefix)

-----

## Development History

Meeting Tools was originally built in collaboration with **Google Gemini**, reaching v2.7 before development transitioned to **Claude (Anthropic)** at v2.8. Claude has handled all development from that point forward.

|Era   |Versions    |Notes                                                                         |
|------|------------|------------------------------------------------------------------------------|
|Gemini|v1.0 – v2.7 |Core architecture, Timer, Ah-Counter, WOD, single-file pattern                |
|Claude|v2.8 – v2.11|Whisper transcription, filler scoring, transcript archive, PWA                |
|Claude|v3.0        |Multi-club architecture, Filler Word Manager                                  |
|Claude|v3.1        |Firebase cloud sync, Progress screen, welcome flow, documentation suite       |
|Claude|v3.2        |Cloud Meeting Report, manual filler scoring, stale data warning, sync UX fixes|
|Claude|v3.2.4      |PACE participation tracker, Club tab, Role Manager, embeddable widgets        |

-----

## Configuration

The app requires an **OpenAI API key** for Word of the Day definitions and Whisper transcription. Officers enter the key once in Settings — it is shared automatically to all club members via Firestore on their next sync.

For clubs using cloud sync, a **Firebase project** with Firestore enabled is required. The Firebase config is embedded directly in `index.html`. The PACE tracker requires a composite index on the `pace_entries` subcollection — Firebase provides a direct console link the first time the query runs.

-----

## Documentation

Full documentation is included in the repo and linked from the app footer.

- **[Manual](manual.html)** — member onboarding, feature walkthroughs, officer setup guide, API key instructions
- **[Technical Reference](technical-reference.html)** — Firestore schema, global state variables, full function reference, deployment notes
- **[Test Plan](test-plan.html)** — test cases covering Timer, Ah-Counter, transcription, WOD, cloud sync, Progress, PACE, reports, PWA behavior, and more
- **[Changelog & Roadmap](changelog.html)** — full release history back to v1.0, plus the prioritized feature backlog

-----

*Version 3.2.4 · Southern Dutchess Toastmasters*