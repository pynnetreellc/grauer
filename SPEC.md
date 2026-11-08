# Grauer — Product Spec (v0.3 draft)

> **Grauer** (said *GROW-er*, rhymes with "power") is named after Grauer's gorilla, the eastern lowland gorilla and the largest gorilla on Earth.
> It is one app for the whole workout: warm-up, strength, calisthenics, HIIT, cardio, yoga and stretching, from first push-up to advanced.

Status: **draft for review**. Nothing is built yet. Items marked **[DECIDE]** need JT's call (also collected in §15).

---

## 1. Decisions locked so far

| Area | Decision |
|---|---|
| Platform | Installable web app (PWA). Works on iPad and Android, fully offline. Can be wrapped with Capacitor for the app stores later. |
| Equipment | **Bodyweight is always enough.** Dumbbells, kettlebells and a **pull-up bar** are optional tracks that swap in harder or loaded versions of moves. |
| Levels | Juvenile → Blackback → Silverback → **Grauer's Gorilla** (confirmed; the final stage is named in full so it's clear where the app's name comes from). |
| Pregnancy & postpartum | Dedicated **Pregnancy** and **Postpartum** tracks instead of a single health-check question (§7a). |
| Exercise variety | A wide library. Moves without a stick-figure demo yet show a **gorilla placeholder** (curling dumbbells for strength/HIIT, The Thinker for everything else). |
| Visual theme | **Silver** is the constant accent (buttons, links, active tab), a nod to silverbacks. Your **level color** (the sweatband: green → blue → silver → gold) shows in small places: avatar ring, level name, progress bar, the figures' sweatbands. |
| Rewards | Advancement is rewarded: the gorilla avatar evolves, and there are unlocks, Grit points, skill challenges and level certificates (§12a). |
| Emphases | Balanced, Strength, Conditioning, Calisthenics, **Mobility & Yoga** (all confirmed). |
| Content review | Programs, ladders, fit test thresholds and safety swaps get reviewed by JT's PT and physical-education contacts before the app is shared (§13a). |
| Structure | Multi-week programs by level, with a **fit test** at the start, middle and end, plus a **Quick Workout** generator for off days or when time is short. |
| Program style | **Hybrid.** Every program mixes styles across the week. The user picks an **emphasis** that shifts the mix. |
| Schedule | User picks **3–6 days/week** and a **session length** (20 / 30 / 45 / 60 min). |
| Every session | **Warm-up → main work → cool-down stretch.** These are built in, not optional extras. |
| Yoga | A full session type, plus yoga-based cool-downs and optional recovery-day flows. |
| Cardio | Guided bike / run / swim / HIIT / Tabata plans with timer and voice cues, then manual logging. No GPS, no health-app sync. |
| Demos | Illustrated figures (start and end position) plus short form cues. No video. |
| Tracking | Sets/reps/weight with progression suggestions, fit test history, body stats + on-device progress photos, streaks and badges. |
| Data | Stored on the device only. Export/import backup file. No accounts. |

---

## 2. Onboarding (about 3 minutes)

1. **Welcome + health check.** A short readiness questionnaire (PAR-Q style: heart condition, chest pain, dizziness, joint issues, medication, recent surgery). Any "yes" shows "check with a doctor first" and turns on **Low-Impact mode** by default. A disclaimer must be accepted once.
1b. **Pregnancy & postpartum.** "Does either apply right now?" Neither / I'm pregnant (due date) / I had a baby in the last 12 months (birth date, vaginal or C-section, cleared by provider yes/no). Picking a track turns Low-Impact on (§7a).
2. **About you.** Name, units (lb/mi or kg/km), optional bodyweight and age.
3. **Experience.** "New to training" / "Some experience" / "Train regularly". This is only a starting guess; the fit test decides the level.
4. **Emphasis** (can be changed later):
   - **Balanced:** an even mix of everything
   - **Strength:** more upper/lower days, heavier progressions
   - **Conditioning:** more HIIT and cardio
   - **Calisthenics:** skill work (handstand, pistol, L-sit, crow) and bodyweight strength ladders
   - **Mobility & Yoga:** more yoga and flexibility, with strength kept at maintenance
5. **Schedule.** Days per week (3–6), which weekdays, session length.
6. **Equipment.** Tick any of: dumbbells, kettlebell, pull-up bar (doorway or mounted). Nothing ticked = pure bodyweight. Optionally enter the weights you own (e.g. "pair of 15s and 25s", "one 35 lb KB") so suggestions only use real weights. A yoga mat is assumed for floor and yoga work.
7. **Cardio access.** Tick any that apply: Run/walk, Bike (indoor or outdoor), Pool (set the pool length: 25 yd / 25 m / 50 m). HIIT and Tabata need nothing.
8. **Body notes.** Toggles for knees, wrists, shoulders, lower back, and "no jumping" (e.g. apartment living). These filter or swap exercises everywhere.
9. **Fit test.** Take it now, or "skip and start at Level 1".

---

## 3. Levels

Gorilla-themed names, with plain labels underneath (confirmed).

| Level | Name | Length | Who |
|---|---|---|---|
| 1 | **Juvenile** (Beginner) | 6 weeks | New, or returning after a long break |
| 2 | **Blackback** (Intermediate) | 8 weeks | Can do ~15 push-ups and hold a 1-min plank |
| 3 | **Silverback** (Advanced) | 8 weeks | Strong base, ready for plyometrics and hard progressions |
| ∞ | **Grauer's Gorilla** (Elite) | Rolling 4-week blocks | Finished Silverback. Rotating blocks that keep progressing |

### Weekly phases inside a program

- **Juvenile (6 wk):** W1 Foundation (form first, no jumping) → W2–3 Build → W4 Recovery (less volume, more yoga) → W5 Push → W6 Test week (lighter, then fit test).
- **Blackback / Silverback (8 wk):** W1–3 Build → W4 Recovery + mid-test → W5–7 Build → W8 Test week.

Recovery weeks matter: they're where progress settles in, and they help prevent burnout and injury.

---

## 4. Fit test — "The Grauer Test"

About 20 minutes including its own warm-up. Taken at week 0, mid-program and at the end. Every test is scored and charted over time.

| # | Test | Measures | Low-impact version |
|---|---|---|---|
| 1 | Push-ups, max in 60 s | Upper push | Knee or incline push-ups (variant recorded) |
| 2 | Bodyweight squats, max in 60 s | Legs / endurance | Same, to a chair |
| 3 | Burpees, max in 60 s | Full-body conditioning | Step-back burpee, no jump |
| 4 | Plank hold, max (3 min cap) | Core | Same, or on knees |
| 5 | Wall sit, max (3 min cap) | Leg endurance | Same |
| 6 | Glute bridge hold or Superman hold, max (2 min cap) | Posterior chain | Same |
| 7 | Sit-and-reach (inches/cm past toes) | Flexibility (tracks the yoga payoff) | Same |
| 8 | *Optional* 3-min step test: count pulse for 60 s after | Cardio recovery | Same |

### Placement (starting thresholds; tune with real use)

| Placement | Push-ups | Squats | Burpees | Plank |
|---|---|---|---|---|
| Juvenile | < 10 | < 30 | < 10 | < 45 s |
| Blackback | 10–29 | 30–44 | 10–19 | 45 s – 2 min |
| Silverback | 30+ | 45+ | 20+ | 2 min+ |

Placement uses the **majority** of tests, not the weakest one. The user can always override and pick a level.

### Moving up a level

At the end of a program, the app suggests moving up when:
- at least **80%** of scheduled sessions were completed, **and**
- the user hits the next level's thresholds on **3 of the 4** main tests.

Otherwise the app offers "Repeat with harder progressions" (repeating a level is normal, not a failure).

---

## 5. Session anatomy

Every session has the same shape, and the timer budget scales with session length:

| Length | Warm-up | Main | Cool-down |
|---|---|---|---|
| 20 min | 3 min | 14 min | 3 min |
| 30 min | 5 min | 20 min | 5 min |
| 45 min | 7 min | 30 min | 8 min |
| 60 min | 8 min | 42 min | 10 min |

Yoga sessions are the exception: the flow has its own gentle build-up and wind-down.

### 5a. Warm-up (always matched to the day)

Four quick stages:
1. **Raise:** heart rate up (march or jog in place, jacks, low-impact jacks, easy pedaling)
2. **Mobilize:** the joints used today (arm circles and thoracic rotations for upper days; leg swings, hip circles, ankle rocks for lower days)
3. **Activate:** wake up key muscles (scap push-ups, band-less pull-aparts, glute bridges, dead bugs)
4. **Prime:** 1–2 easy sets of the first exercise, or short build-up strides for a run

Example, **Lower day, 5 min:** 60 s march → 10 leg swings each way → 4 world's-greatest-stretch per side → 10 glute bridges → 8 slow squats → 5 squat jumps (skipped in Low-Impact mode).

Swim days get a 3-min dry-land shoulder warm-up, then easy laps as the first set.

### 5b. Cool-down / stretching

- Static stretches for the muscles worked, **30–45 s holds** (60 s on Mobility emphasis)
- Ends with **1 min of breathing** (box breathing: 4 in, 4 hold, 4 out, 4 hold)
- Example, **Upper day:** chest doorway stretch → cross-body shoulder → triceps overhead → child's pose → thread-the-needle → breathing.

### 5c. Main block types

| Type | What it looks like |
|---|---|
| **Upper strength** | Push and pull paired as supersets (A1/A2), 3–4 sets, 6–15 reps, 60–90 s rest, short core finisher |
| **Lower strength** | Squat, hinge and single-leg patterns, plus calves and core |
| **Full-body strength** | One move per pattern (push, pull, squat, hinge, carry/core). Used on 3-day plans |
| **Calisthenics skills** | 10 min skill practice (handstand, crow, L-sit, pistol) + strength ladders |
| **HIIT** | Long-interval circuits in rounds (e.g. 3-min rounds of 4 moves, 30 s rest), mostly bodyweight and plyometrics |
| **Tabata** | 20 s on / 10 s off × 8 = 4 min per block, stacked 2–5 blocks |
| **Cardio: run / bike / swim** | Steady, intervals, tempo or long (see §8) |
| **Yoga** | Flow, Power, Recover, Mobility-for-lifters, Wind-down (see §7) |

---

## 6. Weekly templates

### Balanced emphasis

| Days | Week layout (rest days fall between, based on the weekdays you picked) |
|---|---|
| 3 | Full-Body A + HIIT finisher · Cardio + Yoga cool-down · Full-Body B + Tabata finisher |
| 4 | Upper · HIIT · Lower · Cardio + extended stretch |
| 5 | Upper · HIIT · Lower · Cardio · Yoga Flow + skills |
| 6 | Upper · Lower · HIIT · Cardio · Full-Body/Skills · Yoga (Recover) |

### How each emphasis shifts the mix

| Emphasis | Changes |
|---|---|
| Strength | More strength days (e.g. 4-day = Upper · Lower · Upper · Lower), HIIT drops to 5–8 min finishers, cardio is 1 short session |
| Conditioning | HIIT and cardio replace one strength day; strength becomes full-body circuits |
| Calisthenics | Strength days become skill + ladder days, and ladder progressions advance faster |
| Mobility & Yoga | 2 yoga sessions/week, longer cool-downs, strength kept at 2 days |

### Rest days

Optional **10–15 min Recovery** (gentle yoga or mobility). It never breaks a streak if skipped, and doing it earns a small bonus badge.

### Missed sessions

If a day is missed, the app rolls the plan forward (it doesn't pile up) and asks: "Do it today, or skip it?" Two missed weeks in a row offers "Restart this week".

---

## 7. Yoga

- **Pose library:** about 40 poses for v1, each with an illustration, cues, a **beginner modification** and an **advanced option**. Examples: mountain, downward dog, low lunge, warrior I/II/III, triangle, chair, plank, chaturanga (knees-down option), cobra / upward dog, child's pose, pigeon, bridge, tree, boat, crow, seated forward fold, supine twist.
- **Session types:**
  - **Flow** (20–45 min): moving sequences linked with breath
  - **Power** (20–30 min): strength-focused holds, a good HIIT substitute on recovery weeks
  - **Recover** (15–30 min): long passive holds of 1–3 min
  - **Mobility for Lifters** (10–20 min): hips, hamstrings, thoracic spine, shoulders
  - **Wind-down** (10 min): before bed
- **Player:** holds are counted in **breaths** with a time estimate ("hold 5 breaths ≈ 25 s"). A calm chime replaces the HIIT beeps, and the voice cue says the next pose.
- **Progress** shows up in the sit-and-reach test and in total yoga minutes.

---

## 7a. Pregnancy & postpartum tracks

> **Safety gate:** everything in this section is **draft** until reviewed by a **pelvic-health physical therapist** (JT's PT contacts, §13a). The app says so on the track card, and always tells users to follow their own provider.

Chosen in onboarding (step 1b) or later via Redo setup. Both tracks keep **Low-Impact locked on** and replace the normal session list.

### Pregnancy (prenatal)
- Shows **week of pregnancy** and **trimester** from the due date.
- **Rules for every prenatal session:** no jumping, no lying flat on the back, no lying face down, no breath-holding or max efforts, and the **talk test** (you can hold a conversation).
- **Sessions (v1):** *Prenatal Strength & Mobility* (chair squats, incline push-ups, clamshells, bird dog, incline plank, pelvic floor lifts) and *Prenatal Mobility & Breath* (cat-cow, thread the needle, low lunge, warrior II, tree pose by a wall, butterfly, connection breath).
- **"Stop and call your provider" list** on the card: bleeding or fluid leaking, regular painful contractions, dizziness, chest pain or breathlessness before starting, headache, calf pain/swelling, weakness affecting balance, less baby movement.
- After the due date passes, the card offers to switch to the postpartum track.
- **Later:** trimester-specific session variations, and swapping supine moves automatically after ~20 weeks.

### Postpartum (phased return)
| Phase | Unlocks when | Focus |
|---|---|---|
| 1 · Reconnect | Right away (once the provider OKs gentle movement) | Connection breath, pelvic floor lifts and quick flicks, heel slides, pelvic tilts, clamshells, bird dog, walking |
| 2 · Rebuild | Provider has **cleared exercise** (usually around the 6-week check) | Low-impact strength: chair squats, incline push-ups, bridges, clamshells, bird dog, heel slides |
| 3 · Return to impact | **12+ weeks**, cleared, **and** symptom-free with daily life and a 30-min brisk walk | Back to the main program with Low-Impact on, adding jumping gradually |

- Weeks since birth are computed from the birth date. Clearance and symptom-free are toggles on the track card.
- **C-section:** extra note to wait for the scar to heal and for clearance before direct core work or lifting heavier than the baby.
- **"Ease back and check in" list:** leaking, pelvic heaviness/dragging, pain (pelvis, back, scar), bleeding that increases, doming along the belly midline.
- **Later:** a diastasis (ab separation) self-check guide, a fuller return-to-running progression, and a pelvic floor training log.

---

## 8. Cardio

Intensity uses an **effort scale** because there's no heart-rate monitor. Manual HR entry is optional.

| Effort | Feels like | RPE |
|---|---|---|
| Easy | Can talk in full sentences | 3–4 |
| Moderate | Short sentences | 5–6 |
| Hard | A few words at a time | 7–8 |
| All-out | Can't talk | 9–10 |

| Mode | Juvenile | Blackback | Silverback |
|---|---|---|---|
| **Run** | Walk/run intervals (1 min run / 90 s walk × 8), building to 25–30 min continuous by W6 | Easy runs, tempo, 400 m-style repeats (by time) | Long runs, hill repeats, fartlek |
| **Bike** | 20–30 min steady easy-moderate, short surges | Intervals (e.g. 6 × 2 min hard / 2 min easy), tempo | Over-unders, sprints, long rides |
| **Swim** | Sets of 25s with rest (e.g. 10 × 25, 30 s rest) + kick drills | 50s/100s sets, drills, pull sets | Pyramids, threshold 100s, longer continuous swims |
| **HIIT/Tabata** | 30 s on / 30 s off, low impact | 40/20 | 45/15, stacked Tabatas |

- The app **rotates between the modes the user ticked** in onboarding. It can also be pinned ("always run").
- Swim plans are written in lengths of the user's pool and assume the user can already swim.
- **Logging afterward:** duration (pre-filled from the timer), distance, average effort, optional HR, notes.

---

## 9. Exercise library and progression ladders

### Library size

**Now:** 119 exercises across warm-up, strength (bodyweight, dumbbell, kettlebell, pull-up bar), HIIT, yoga, stretching, and pre & postnatal. 56 have animated stick-figure demos. The rest show a gorilla placeholder until their demo is drawn.

### Library size (v1 target)

- ~90 bodyweight exercises
- ~30 dumbbell/kettlebell exercises
- ~40 yoga poses
- ~30 stretches
- ~25 warm-up drills

Each item has: name, illustration(s), 2–4 form cues, common mistakes, muscles, tags (pattern, impact level, joint stress), easier/harder links and equipment swaps.

### Ladders (exercise families ordered easiest → hardest)

| Pattern | Ladder |
|---|---|
| **Push** | Wall push-up → incline (counter) → knee → full → decline → diamond → archer → pseudo-planche → assisted one-arm |
| **Squat** | Box/chair squat → air squat → split squat → Bulgarian split squat (couch) → shrimp squat → assisted pistol → pistol |
| **Hinge** | Glute bridge → single-leg bridge → elevated hip thrust → single-leg RDL (bodyweight) → sliding hamstring curl (towel) |
| **Pull** (no bar) | Prone Y-T-W → doorframe row → towel door row → table inverted row → feet-elevated table row |
| **Pull** (bar track) | Dead hang → scapular pulls → negative pull-up (5 s lowering) → band-free partial reps → full pull-up → chin-up/pull-up sets → L-sit pull-up → archer pull-up |
| **Core** (bar track) | Hanging knee raise → hanging leg raise → toes-to-bar |
| **Core** | Dead bug → plank → hollow hold → side plank w/ reach → tuck L-sit (chairs/floor) → V-ups |
| **Plyo** | Step-ups → squat jumps → split jumps → tuck jumps → broad jumps |
| **Shoulder/Inversion** | Pike push-up → elevated pike → wall handstand hold → wall handstand push-up negatives |

**Equipment swaps:**
- Squat → goblet squat
- Hinge → DB RDL / KB swing
- Push → floor press, overhead press
- Pull → one-arm row, gorilla row; with a bar, pull-ups replace table rows as the main pull
- Full-body → clean & press, Turkish get-up, farmer carry

When a pull-up bar is ticked, upper days use the bar ladder for the main pull and keep a row variation as the second pull. Without a bar, nothing is lost: the table-row ladder covers pulling.

### Progression rule (double progression)

1. Each exercise has a **rep range** (e.g. 8–12).
2. After each set the user taps **Easy / Good / Hard**, a simple stand-in for RPE.
3. When **all sets hit the top of the range** and the last set was not "Hard", the next session's suggestion moves up:
   - loaded track: **+1 weight step** (the next weight the user owns)
   - bodyweight: **next variation** on the ladder, reset to the bottom of the range
4. Missing the **bottom of the range two sessions in a row** suggests stepping back one rung.
5. Suggestions are just suggestions; the user can always override them.

---

## 10. Workout player (the core screen)

- Full-screen, with a big timer and the current move's illustration + cues. A "Next up" preview below.
- **Two exercise modes:**
  - **Reps:** log reps/weight, then the rest timer starts automatically
  - **Timed:** countdown with work/rest phases
- **Audio:** beeps at 3-2-1 and a spoken "Go / Rest / Next: squat jumps" (Web Speech). Plays alongside the user's own music.
- **Screen stays awake** during a workout (Wake Lock API).
- Controls:
  - Pause, skip and back
  - **Swap** (easier / harder / equipment version)
  - **Low-Impact toggle** mid-workout
- iPad: landscape layout with the illustration on the left and timer/log on the right. Phone: stacked layout.
- End screen: summary, PRs hit, streak status, "How did that feel?" (1–5).

---

## 11. Quick Workout generator

- **Inputs:**
  - **time** (10 / 15 / 20 / 30 / 45 min)
  - **focus** (Full Body, Upper, Lower, Core, HIIT, Tabata, Cardio, Yoga, Stretch only)
  - **equipment**
  - **Low-Impact** on/off
- Uses the user's **current level and ladder positions**, so a Blackback user gets Blackback-level moves.
- Still includes warm-up and cool-down, scaled down (a 10-min session = 2 / 6 / 2).
- Logs exactly like a program session and counts toward streaks.
- **"Repeat"** and **"Save as favorite"** buttons on the end screen.

---

## 12. Progress and motivation

- **History:** a calendar heat-map of sessions. Tap a day to see the log.
- **Charts:**
  - fit test scores over time (one line per test)
  - strength per exercise (best set, estimated volume)
  - cardio minutes/distance per week
  - yoga minutes
  - bodyweight
- **PRs:** automatic personal-record detection with a celebration on the end screen.
- **Body stats:** weight, optional measurements (waist, chest, hips, arms, thighs), and **progress photos** (front/side/back) in a side-by-side compare view. Photos are stored **on the device only** and never uploaded.
- **Streaks:** **weekly** (did you hit your planned days this week?), not daily, so rest days never break a streak.
- **Badges** (examples):
  - First Session
  - 10 / 50 / 100 sessions
  - First full push-up
  - First pistol
  - 1-min plank
  - 100 yoga minutes
  - Swam 1 mile total
  - Perfect week
  - Finished Juvenile / Blackback / Silverback
  - Reached Grauer's Gorilla

---

## 12a. Rewards for advancement

The goal: moving up a level should feel like a **big moment**, and the weeks in between should still feel rewarding. **Rule of thumb:** rewards celebrate effort and progress. They never let you buy a level-up, because the fit test gates still decide advancement.

### The gorilla evolves with you

The sweatband gorilla from the logo is the user's **avatar** on the home screen, and it changes at each level:

| Level | Avatar | Sweatband |
|---|---|---|
| Juvenile | Young gorilla, smaller frame | Green |
| Blackback | Bigger and broader, all-black coat | Blue |
| Silverback | Full size, with silver across the shoulders and back | Silver |
| Grauer's Gorilla | Biggest, most muscular version | **Gold** |

Wristbands always match the sweatband. The current drafts (`brand/v2/avatar-*.svg`) change only the band color. The body-size changes per level are a later art pass.

### Level-up ceremony

When a level is passed (§4 gates), the app shows a full-screen celebration:
1. The avatar transforms, old to new.
2. A **before/after card** compares your fit test from the start of the level to now (e.g. "Push-ups: 8 → 23").
3. The level's unlocks are revealed (below).
4. A **level certificate** is generated: an image with the avatar, level name, date and best stats. Save it or share it from the device's share sheet (only when you choose to).

### Unlocks by level

| Reaching… | Unlocks |
|---|---|
| Blackback | Blackback avatar · **Skill Challenges** tab · sweatband color pack 1 · "Canopy" app theme |
| Silverback | Silverback avatar · **Power HIIT** series (advanced plyometrics) · sweatband pack 2 · "Kahuzi" theme (named for Mount Kahuzi, Grauer's gorilla home range) |
| Grauer's Gorilla | Gold sweatband avatar · rolling **Elite blocks** · "Hall of Fame" certificate · build-your-own-session editor · "Gold" theme |

### Grit points (progress between level-ups)

You earn points for showing up and doing the full session:

| Action | Grit |
|---|---|
| Complete a session | +10 |
| Did the full warm-up **and** cool-down (encourages not skipping them) | +3 |
| Recovery-day yoga/mobility | +5 |
| Personal record | +5 |
| Perfect week (all planned days) | +20 |
| Fit test improvement (per test improved) | +5 |

- Grit fills a **progress bar** toward the level's next milestone, and spends on **cosmetics only**: sweatband colors, wristbands, app themes.
- Grit can't skip a level or a fit test.

### Skill Challenges (badges for real-world feats)

Each challenge is a one-off test recorded in the player. Passing it earns a badge.

| Level | Challenges |
|---|---|
| Juvenile | First full push-up · 60 s plank · 25 squats unbroken · 10-min continuous run/bike/swim · touch your toes |
| Blackback | 20 push-ups · crow pose 10 s · pistol to a box · 2-min wall sit · **first pull-up** (bar track) · 30-min continuous cardio |
| Silverback | Archer push-up · full pistol each leg · wall handstand 60 s · L-sit 10 s · 10 pull-ups (bar) · swim/run/bike 5 km-equivalent |
| Grauer's Gorilla | Freestanding handstand 10 s · assisted one-arm push-up · 100 burpees for time · toes-to-bar (bar) · splits progress check |

### Repeating a level

Repeating a level is normal, not a failure. It earns a **"Second Lap"** badge, keeps all Grit, and uses harder ladder positions so it doesn't feel like a rerun.

---

## 13. Technical plan

- **Stack:** vanilla JavaScript (ES modules), HTML and CSS, with **no build step**, the same approach as Panda Planner. This version is split into a few files because it's much bigger than one page.
- **Content as data:** exercises, ladders, programs and yoga flows live in JSON files (`content/*.json`). Tweaking a program means editing data, not code.
- **Storage:** IndexedDB (via a tiny wrapper) for logs, stats and photos. `navigator.storage.persist()` is requested on first run.
- **Offline:** a service worker caches the app shell, content and illustrations. A web app manifest provides install and the icon.
- **Audio:** Web Audio API for beeps, Web Speech API for voice cues. On iOS, audio is unlocked on the first tap of "Start".
- **Charts:** hand-drawn SVG (no library needed for these simple line charts).
- **Hosting:** GitHub Pages. It's free, and PWAs require HTTPS.
- **Backup:** "Export" downloads one `.json` file (photos optional, since they make it large). "Import" restores it. The app reminds the user to export monthly.

### iPad / iOS caveats to design around

- Safari can **clear data for websites not used in a while**. Apps **added to the Home Screen** are treated much more safely. Onboarding must walk the user through **Share → Add to Home Screen**, and backup reminders are the safety net.
- Audio and speech only start after a user tap, which is handled by the Start button.
- Screen wake lock is supported in current iOS/Android. If it's unavailable, the app shows a tip to change auto-lock.

### Folder layout (planned)

```
grauer/
  index.html          app shell
  manifest.webmanifest
  sw.js               service worker (offline)
  css/app.css
  js/
    app.js            routing + screens
    db.js             IndexedDB wrapper
    player.js         workout player + timer + audio
    planner.js        builds weekly schedule from program + settings
    progression.js    double-progression + ladder logic
    generator.js      Quick Workout
    charts.js         SVG charts
  content/
    exercises.json  ladders.json  programs.json  yoga.json  cardio.json  warmups.json
  img/exercises/*.svg illustrations
  brand/              logo + icon sources
```

---

## 13a. Content review (PT and physical-education reviewers)

Claude drafts every program from standard training principles. JT's PT and physical-education contacts review it before the app goes to anyone besides JT.

- **What gets reviewed:**
  - the fit test and placement thresholds
  - progression ladders
  - weekly templates and recovery weeks
  - low-impact and body-note swaps (knees, wrists, shoulders, low back)
  - yoga modifications
  - the readiness questionnaire wording
- **How:** the app content lives in JSON, so a small script exports it to a **review spreadsheet**, with one tab each for exercises, ladders, programs and yoga. Reviewers comment or edit there, and the changes go back into the JSON.
- **Tracking:** each content item carries `reviewed_by` and `reviewed_on`. A build check can list anything not yet reviewed.
- **Gate:** Juvenile content (M2) must be reviewed before the app is shared with anyone else.

---

## 14. Build milestones

| # | Milestone | Done when |
|---|---|---|
| M1 ✅ | **Shell + player** (done 2026-11-08) | Installs on iPad/Android. Onboarding works. Player runs a hard-coded session with warm-up, cool-down, timer and voice. ~40 core bodyweight moves in the library. |
| M2 | **Juvenile program** | All emphases × 3–6 days × session lengths generate a real schedule. Logging and double progression work. |
| M3 | **Fit test + progress** | Grauer Test flow, placement, charts, body stats and photos. |
| M4 | **Cardio + HIIT/Tabata + Yoga** | Run/bike/swim plans, interval engine, yoga player and the first ~25 poses. |
| M5 | **Quick Workout + rewards** | Generator, favorites, streaks, badges, Grit, skill challenges, level-up ceremony + certificates, avatar evolution, DB/KB/bar tracks. |
| M6 | **Blackback, Silverback, Grauer's Gorilla content + polish** | All levels, full illustration set, backup/restore, accessibility pass. |
| Later | App stores (Capacitor), optional sync | Only if wanted. |

---

## 15. Open questions

**Resolved in v0.2:**
- Pull-up bar is an optional track.
- A yoga mat is assumed.
- Level names are kept.
- Mobility & Yoga stays as the 5th emphasis.
- PT and physical-education contacts will review the content.
- Jungle colors are chosen. The app accent is **silver**, with per-level colors (v0.3).
- Final level renamed **Grauer's Gorilla** (v0.3).
- Pregnancy & postpartum are dedicated tracks (v0.3).
- **Logo:** the arms-crossed sweatband gorilla bust. The official file is `brand/grauer-icon.svg`, and the level avatars are in `brand/avatars/`. The flex pose stays in `brand/v2/` as a possible celebration graphic (e.g. the level-up screen).

**Still open:**
1. **Voice.** Device text-to-speech (free, offline, a bit robotic) for now, or recorded voice clips later?
2. **Sweatband colors per level.** Green / Blue / Silver / Gold OK?
3. **Trademark.** Do a quick search on "Grauer" for fitness apps before any app-store release (not needed for a personal web app).
