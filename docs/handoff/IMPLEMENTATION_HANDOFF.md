# PROYECTO 21 — Implementation Handoff

## Fixed Decisions
- Domain: proyecto21.space
- Hosting: Vercel
- DNS: Cloudflare
- Email is official digital activation channel
- Spotify is primary music service
- One participant
- No login/profile
- Participant sees only active day
- No history/calendar/future preview
- One persistent P21 shell
- Content may be managed in DB/backend dashboard/Sheet
- Manual force_active_day override is mandatory
- QR may permanently point to https://proyecto21.space

## Recommended Build Order

### Phase 0 — Bootstrap
Goal: make printed QR safe to use.

Build:
- Vercel deployment
- domain connected
- HTTPS
- minimal P21 shell
- locked state
- noindex/nofollow

### Phase 1 — D1/D2
Build:
- TrackCard
- SingleTrackInput
- MultiTrackInput
- response storage
- completion state
- editable content

### Phase 2 — D3
Build:
- bracket
- round progression
- persistence
- wildcard
- result storage

### Phase 3 — D4–D7
Build/reuse:
- TrackList
- short text input
- reveal state
- 3-track Memory Recovery
- physical-first/digital-response flows

### Phase 4 — Mid/Late Project
Only as needed:
- Choice/conditional reveal for D12
- MediaBlock for children/guests
- ArchiveBlock for old emails/stories
- time-specific activation for After Dark
- guest sequence for D19

### Phase 5 — D21
Custom final experience:
- Track 21
- accumulated playlist
- P21+ reveal
- first P21+ track response

## Do Not Overbuild
Avoid unless later required:
- login
- profiles
- calendar
- previous-day browsing
- automated email campaigns
- Spotify auth
- automatic playlist sync
- custom CMS
- push notifications
- AI chat
- advanced analytics

## Immediate Delivery Target
Before D0/D1 QR is used:
1. https://proyecto21.space resolves.
2. Site is private/unindexed.
3. Minimal P21 branding renders.
4. Locked state works.
5. D1 can replace locked state when activated.

## Source of Truth
Use:
0. NARRATIVE_UPDATE.md — overrides any "anonymous" framing elsewhere. The project is known; the plan is not.
1. PROJECT_CONTEXT.md — creative/project context.
2. DIGITAL_FUNCTIONAL_SPEC.md — system requirements.
3. CONTENT_MATRIX.md — current D0–D21 mapping.

When ambiguous:
- preserve physical-first mechanics;
- avoid adding UI if day already works physically;
- keep participant experience minimal;
- never expose future content;
- prefer configuration over hardcoded day logic.
