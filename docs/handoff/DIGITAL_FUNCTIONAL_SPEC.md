# PROYECTO 21 — Digital Support Functional Specification

## Purpose
Build a lightweight, private, mobile-first digital layer for PROYECTO 21.

The digital system does not replace the physical experience. It supports selected days by:
- delivering music/content;
- collecting responses;
- executing interactive mechanics;
- storing participant input;
- enabling callbacks using earlier responses;
- supporting timed/revealed experiences;
- providing the final D21 experience.

## Core Architecture

### 1. Content Configuration
Defines what the active day contains:
- copy
- songs
- media
- activation date/time
- interaction type
- completion text
- special config

Content should be editable without redeploying whenever practical.

### 2. Experience Components
Defines how the day behaves.

Reusable components:
- text block
- track card
- track list
- single-track input
- multi-track input
- short-text input
- choice cards
- bracket
- media block
- archive/reveal block
- completion state

### 3. Response Storage
Stores what P21 learns:
- Spotify URLs
- title/artist
- short text
- choices
- bracket decisions
- winners
- tags/metadata

Stored responses are not shown as participant history, but may be reused later.

## User Model
One participant.

No:
- signup
- login/password
- profile
- app installation
- calendar navigation
- history browsing

Preferred flow:
QR / email / physical prompt → proyecto21.space → current active experience

## Access and Navigation
Primary domain:
https://proyecto21.space

Rules:
- one persistent project URL
- no participant navigation
- no previous-day archive
- no future-day preview
- only current active experience visible

Optional private token may be used if desired.

## Activation Logic
Each day has:
- activation date/time
- status
- experience type
- content/config

Frontend uses date/time unless manual override exists.

Mandatory:
force_active_day

Behavior:
- null → use schedule
- set → show forced day

## Persistent Shell
All digital experiences share:
- PROYECTO 21 / P.21 identity
- countdown marker when desired
- current content
- current interaction
- CTA
- completion/reveal state

No normal website navigation.

## Locked State
If entered before experience is available:

PROYECTO 21
P.21 / XX
TODAVÍA NO.

Copy configurable.

## Completed State
After submission:
- show completion/reveal
- prevent accidental duplicate submission
- optionally leave received music visible
- do not reveal next experience

## Email
Official digital activation channel.

MVP:
- manual sending is acceptable
- no email automation required
- email contains minimal context + CTA
- full experience remains on web

## Spotify
Primary music platform.

### P21 → Participant
Support:
- track title
- artist
- Spotify URL
- CTA to listen

### Participant → P21
Preferred:
- Spotify URL

Fallback:
- title
- artist

No Spotify OAuth required.

## Experience Types

### single_track
P21 delivers one track; participant returns one.

### multi_track
Participant returns configurable N tracks.

### track_plus_text
Participant returns track + short text/line.

### track_list
P21 delivers multiple tracks; participant may return one.

### choice
Participant selects one option; system may reveal conditional content.

### bracket
8-track elimination tournament.

### media_exchange
Audio/video/image + track; participant returns track/text.

### archive
Document/image/story-like content + optional response.

### reveal
Primarily presentational/completion.

### custom
Reserved for D21 or unusual cases.

## D0–D21 Digital Support Matrix

| Day | Digital Role | Requirement |
|---|---|---|
| D0 | Hybrid | QR opens project; locked state before D1 |
| D1 | Core | Opening Track + single-track response |
| D2 | Hybrid | P21 track + 2–3 track input; tag SHOWER |
| D3 | Core | Email activation + 8-track bracket + wildcard |
| D4 | Light/Hybrid | Physical puzzle; web may handle reveal/track/response |
| D5 | Light/Core | Recovery Kit + single-track response |
| D6 | Hybrid/TBD | Track + lyric/text support; exact mechanic later |
| D7 | Hybrid | Physical Memory Recovery + 3-track input + reveal |
| D8 | Light | Single-track exchange + optional scene text |
| D9 | Light/Hybrid | Child #1 media/track + response |
| D10 | Light | Single-track exchange |
| D11 | TBD/Light | Track/text + single-track response |
| D12 | Core | 3-way choice → conditional track → response |
| D13 | Light | Reuse D2 SHOWER track + receive morning track |
| D14 | Light/Hybrid | Same infra as D9 |
| D15 | Hybrid | Archive/media/email content + story/track response |
| D16 | Light | Time-specific activation + song exchange |
| D17 | Light/None | Mainly physical; optional playback/response |
| D18 | Hybrid/TBD | PRIME story/media/track + response |
| D19 | Core/Hybrid | Guest media/tracks sequence + freedom-song response |
| D20 | Light | Minimal future-facing track exchange |
| D21 | Core/Custom | Track 21 + playlist + P21+ transition |

## Minimum Data Model

### days
- id
- day_number
- countdown_number
- activation_datetime
- status
- experience_type
- title
- intro_text
- instructions
- completion_text
- config_json

### tracks
- id
- day_id
- source
- source_name
- title
- artist
- spotify_url
- tag
- sort_order
- playlist_status

Possible source:
P21, HER, DANIEL, CHILD_1, CHILD_2, CHILD_3, FRIEND, FAMILY

### responses
- id
- day_id
- response_type
- payload_json
- created_at

### media
- id
- day_id
- type
- url
- caption
- sort_order

Media types:
image, audio, video, document

## Tags
OPENING
SHOWER
BRACKET
WILDCARD
RECOVERY
LYRIC
TRACK21
NOSTALGIA
EVERYDAY
CHILD_1
CHILD_2
CHILD_3
GUILTY
HANDS
MOOD
MORNING
ARCHIVE
STORY
AFTER_DARK
RETURN
PRIME
FREEDOM
FUTURE
P21_PLUS

## Admin / Content Management
No custom CMS required.

Acceptable:
- Supabase dashboard
- DB table
- spreadsheet-backed config

Admin must be able to change:
- active day
- activation date/time
- status
- copy
- songs
- media
- experience type
- config
- completion message

## MVP Requirements
Must have:
- mobile-first responsive UI
- persistent domain
- HTTPS
- date/time scheduling
- manual active-day override
- locked state
- completed state
- no previous/future browsing
- Spotify links
- single-track input
- multi-track input
- short text input
- choice component
- bracket mechanic
- conditional reveal
- image/audio/video support
- response storage
- reusable previous responses
- configurable day content
- custom/flexible D21
- noindex/nofollow

## Privacy / Security
Minimum:
- HTTPS
- private/unlisted project
- noindex
- nofollow
- no public sitemap if avoidable
- optional private URL token
- no sensitive client-side config

## Out of Scope
Do not build:
- signup/login
- profiles
- participant history
- calendar
- chat
- push notifications
- native app
- Spotify OAuth
- automatic playlist sync
- AI assistant in the web app
- custom CMS
- advanced analytics

## Suggested Technical Direction
- frontend: Next.js / React
- hosting: Vercel
- DNS/domain: Cloudflare
- backend/database: Supabase
- music: Spotify URLs
- email: manual P21 email for MVP

## Global Acceptance Criteria
1. proyecto21.space loads correctly on mobile.
2. Only active day can be viewed.
3. Future/previous days are not participant-accessible.
4. Admin can force active day.
5. Content can change without frontend redeploy where practical.
6. Spotify links can be delivered/submitted.
7. Single/multi-track responses persist.
8. D3 bracket stores choices/winner/wildcard.
9. D12 branching stores mood + response.
10. Media can be displayed.
11. Earlier responses can be reused later.
12. Duplicate accidental submissions are prevented.
13. D21 supports custom final reveal.
14. Experience works cleanly on iPhone-sized screens.

## Implementation Principle
Do not build 21 independent pages.

Build:
one persistent P21 shell
+ configurable day content
+ reusable experience components
+ response storage
