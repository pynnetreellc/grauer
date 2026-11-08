"""One-off content expansion (2026-11-08): new poses, ~65 exercises, pre/postnatal sessions.
Kept in dev/ as a record of what was added. Safe to re-run (skips ids that already exist).
Run from the grauer folder:  python dev/add_content_v2.py
"""
import json
import pathlib

C = pathlib.Path("content")

# ---------- poses ----------
poses = json.loads((C / "poses.json").read_text(encoding="utf-8"))
poses.update({
    "heel_slide_out": {"P": [100, 136], "S": [56, 136], "H": [38, 134], "W": [100, 138], "A": [158, 141], "A2": [120, 143]},
    "tree": {"front": True, "P": [100, 86], "S": [100, 42], "H": [100, 24], "W": [104, 4], "W2": [96, 4], "A": [108, 146], "A2": [104, 112], "eb": 1, "eb2": -1},
    "warrior2": {"front": True, "P": [100, 100], "S": [100, 56], "H": [104, 38], "W": [156, 56], "W2": [44, 56], "A": [140, 146], "A2": [64, 146]},
    "chair_pose": {"P": [86, 106], "S": [104, 66], "H": [110, 49], "W": [124, 24], "A": [100, 146]},
    "wall_stand": {"P": [66, 86], "S": [66, 42], "H": [67, 24], "W": [70, 88], "A": [74, 146]},
})
(C / "poses.json").write_text(json.dumps(poses, indent=1), encoding="utf-8")

# ---------- exercises ----------
lib = json.loads((C / "exercises.json").read_text(encoding="utf-8"))
have = {e["id"] for e in lib["exercises"]}
for e in lib["exercises"]:  # yoga poses get their own category now
    if e["id"] in ("childs-pose", "cobra", "downward-dog"):
        e["category"] = "yoga"


def ex(id, name, category, cues, mistake, muscles, **kw):
    d = {"id": id, "name": name, "category": category, "impact": kw.pop("impact", "low"),
         "cues": cues, "mistake": mistake, "muscles": muscles}
    d.update(kw)
    return d


WALL = {"type": "wall", "x": 50, "w": 8}
BOX = {"type": "box", "x": 132, "y": 110, "w": 52, "h": 38}

NEW = [
    # --- bodyweight strength progressions ---
    ex("decline-push-up", "Decline Push-Up", "strength", ["Feet up on a step, couch or chair", "Hands just wider than shoulders", "Lower with control, body stays straight"], "Letting the hips pike up.", ["upper chest", "shoulders", "triceps"], pattern="push", easier="push-up", harder="diamond-push-up", position="prone"),
    ex("diamond-push-up", "Diamond Push-Up", "strength", ["Hands close together under your chest", "Elbows track back along your sides", "Full range, chest to hands"], "Elbows flaring wide.", ["triceps", "chest"], pattern="push", easier="decline-push-up", harder="archer-push-up", position="prone"),
    ex("archer-push-up", "Archer Push-Up", "strength", ["Very wide hands", "Shift your weight over one arm as you lower", "The other arm stays nearly straight"], "Twisting the hips.", ["chest", "shoulders", "triceps"], pattern="push", easier="diamond-push-up", perSide=True, position="prone"),
    ex("elevated-pike-push-up", "Elevated Pike Push-Up", "strength", ["Feet on a chair, hips stacked high", "Lower the head between your hands", "Press straight back up"], "Dropping the hips toward a regular push-up.", ["shoulders", "triceps"], pattern="push", easier="pike-push-up", harder="wall-handstand-hold", position="inverted"),
    ex("wall-handstand-hold", "Wall Handstand Hold", "strength", ["Walk your feet up the wall, chest facing it", "Arms locked, push the floor away", "Squeeze glutes, ribs in"], "Banana back. Keep the body in a line.", ["shoulders", "core"], pattern="push", mode="time", easier="elevated-pike-push-up", position="inverted"),
    ex("bulgarian-split-squat", "Bulgarian Split Squat", "strength", ["Back foot on a couch or chair", "Drop straight down on the front leg", "Front heel stays planted"], "Standing too close to the bench.", ["quads", "glutes"], pattern="squat", perSide=True, easier="reverse-lunge", harder="shrimp-squat"),
    ex("shrimp-squat", "Shrimp Squat", "strength", ["Hold one foot behind you", "Lower the back knee to the floor", "Stand up without pushing off the back foot"], "Rushing. Go slow and control it.", ["quads", "glutes", "balance"], pattern="squat", perSide=True, easier="bulgarian-split-squat", harder="assisted-pistol-squat"),
    ex("assisted-pistol-squat", "Assisted Pistol Squat", "strength", ["Hold a door frame or post", "One leg straight out in front", "Sit down on the other leg as low as you can control"], "Pulling too hard with the arms.", ["quads", "glutes", "balance"], pattern="squat", perSide=True, easier="shrimp-squat", harder="pistol-squat"),
    ex("pistol-squat", "Pistol Squat", "strength", ["Arms forward for balance", "Free leg straight out", "Full depth, then stand tall"], "Heel lifting off the floor.", ["quads", "glutes", "balance"], pattern="squat", perSide=True, easier="assisted-pistol-squat"),
    ex("elevated-hip-thrust", "Elevated Hip Thrust", "strength", ["Upper back on the couch edge", "Drive hips up to a flat tabletop", "Chin tucked, ribs down"], "Arching the lower back at the top.", ["glutes", "hamstrings"], pattern="hinge", easier="single-leg-glute-bridge", harder="single-leg-rdl"),
    ex("single-leg-rdl", "Single-Leg Romanian Deadlift", "strength", ["Soft knee on the standing leg", "Hinge forward as the back leg lifts", "Hips stay square to the floor"], "Rounding the back to reach lower.", ["hamstrings", "glutes", "balance"], pattern="hinge", perSide=True, easier="elevated-hip-thrust"),
    ex("sliding-hamstring-curl", "Sliding Hamstring Curl", "strength", ["Lie on your back, heels on a towel (smooth floor)", "Lift hips into a bridge", "Slide heels out and back in"], "Hips dropping as you slide.", ["hamstrings", "glutes"], pattern="hinge", position="supine"),
    ex("prone-ytw", "Prone Y-T-W", "strength", ["Lie face down, forehead on a towel", "Lift arms into a Y, then T, then W", "Squeeze shoulder blades together"], "Shrugging toward the ears.", ["upper back", "rear shoulders"], pattern="pull", position="prone"),
    ex("doorframe-row", "Doorframe Row", "strength", ["Grip both sides of a sturdy door frame", "Lean back with arms straight", "Pull your chest to the frame"], "Using hips instead of arms and back.", ["back", "biceps"], pattern="pull", harder="towel-door-row"),
    ex("towel-door-row", "Towel Door Row", "strength", ["Loop a towel around the handles of a closed, locked door", "Lean back, walk feet closer to make it harder", "Row elbows back past your ribs"], "Using a door that opens toward you.", ["back", "biceps"], pattern="pull", easier="doorframe-row", harder="table-row"),
    ex("table-row", "Table Inverted Row", "strength", ["Lie under a very sturdy table, grip the edge", "Body straight, heels on the floor", "Pull your chest up to the table"], "Using a wobbly table. Test it first!", ["back", "biceps", "core"], pattern="pull", easier="towel-door-row", position="supine"),
    ex("hollow-hold", "Hollow Hold", "strength", ["Lower back glued to the floor", "Arms overhead, legs long and low", "Bend the knees to make it easier"], "Lower back arching off the floor.", ["deep core"], pattern="core", mode="time", harder="v-up", position="supine"),
    ex("side-plank", "Side Plank", "strength", ["Elbow under shoulder", "Hips lifted in a straight line", "Knees down to make it easier"], "Hips sagging toward the floor.", ["obliques", "shoulders"], pattern="core", mode="time", perSide=True, position="sidelying"),
    ex("v-up", "V-Up", "strength", ["Start long on your back", "Lift arms and legs to meet in the middle", "Lower slowly"], "Using momentum and slamming down.", ["abs", "hip flexors"], pattern="core", easier="hollow-hold", position="supine"),
    ex("tuck-l-sit", "Tuck L-Sit", "strength", ["Hands on two sturdy chairs or the floor", "Push down and lift your hips", "Knees tucked to chest"], "Shoulders shrugged up.", ["core", "triceps", "shoulders"], pattern="core", mode="time", position="seated"),
    ex("crow-pose", "Crow Pose", "strength", ["Hands flat, knees on the backs of your arms", "Lean forward until the feet float", "Pillow in front of your face!"], "Looking down at your hands. Look forward.", ["core", "shoulders", "balance"], pattern="skill", mode="time"),
    ex("plank-shoulder-taps", "Plank Shoulder Taps", "strength", ["High plank, feet wide", "Tap the opposite shoulder", "Hips stay still"], "Rocking the hips side to side.", ["core", "shoulders"], pattern="core", position="prone"),
    # --- dumbbells / kettlebell ---
    ex("goblet-squat", "Goblet Squat", "strength", ["Hold a dumbbell or kettlebell at your chest", "Sit down between your heels", "Elbows inside the knees at the bottom"], "Chest collapsing forward.", ["quads", "glutes", "core"], pattern="squat", equipment=["db", "kb"], easier="air-squat"),
    ex("db-romanian-deadlift", "Dumbbell Romanian Deadlift", "strength", ["Weights in front of the thighs", "Push hips back, soft knees", "Stop when the hamstrings are stretched, then stand"], "Rounding the back.", ["hamstrings", "glutes", "back"], pattern="hinge", equipment=["db", "kb"]),
    ex("kb-swing", "Kettlebell Swing", "strength", ["Hike the bell back between your legs", "Snap the hips forward to float it to chest height", "Arms are just ropes"], "Squatting the swing or lifting with the arms.", ["glutes", "hamstrings", "heart rate"], pattern="hinge", equipment=["kb"]),
    ex("db-floor-press", "Dumbbell Floor Press", "strength", ["Lie on your back, knees bent", "Press the weights up over your chest", "Lower until the elbows touch the floor"], "Bouncing the elbows.", ["chest", "triceps"], pattern="push", equipment=["db"], position="supine"),
    ex("db-overhead-press", "Dumbbell Overhead Press", "strength", ["Weights at the shoulders", "Press straight up, biceps by the ears", "Ribs down, glutes tight"], "Leaning back to finish the rep.", ["shoulders", "triceps"], pattern="push", equipment=["db", "kb"]),
    ex("one-arm-db-row", "One-Arm Dumbbell Row", "strength", ["Hand and knee on a couch or bench", "Pull the weight to your hip", "Pause, then lower slowly"], "Twisting the torso to lift.", ["back", "biceps"], pattern="pull", perSide=True, equipment=["db", "kb"]),
    ex("gorilla-row", "Gorilla Row", "strength", ["Wide stance, hinge forward, weights on the floor", "Row one weight while the other stays down", "Alternate sides"], "Standing up as you row.", ["back", "biceps", "core"], pattern="pull", equipment=["db", "kb"]),
    ex("db-biceps-curl", "Dumbbell Biceps Curl", "strength", ["Elbows pinned to your sides", "Curl up, squeeze at the top", "Lower slowly. No swinging"], "Swinging the body to lift.", ["biceps", "forearms"], pattern="pull", equipment=["db"]),
    ex("db-reverse-lunge", "Dumbbell Reverse Lunge", "strength", ["Weights at your sides", "Step back, back knee toward the floor", "Drive through the front heel"], "Front knee caving in.", ["quads", "glutes"], pattern="squat", perSide=True, equipment=["db", "kb"], easier="reverse-lunge"),
    ex("farmer-carry", "Farmer Carry", "strength", ["Heavy weights at your sides", "Stand tall, shoulders back", "Walk with short, controlled steps"], "Leaning to one side.", ["grip", "core", "traps"], pattern="carry", mode="time", equipment=["db", "kb"]),
    ex("turkish-get-up", "Turkish Get-Up", "strength", ["Weight locked out over your shoulder, eyes on it", "Roll to elbow, hand, hips up, sweep the leg, stand", "Reverse it slowly"], "Rushing. Every step is a pause.", ["shoulders", "core", "full body"], pattern="full", perSide=True, equipment=["kb", "db"]),
    ex("db-clean-and-press", "Dumbbell Clean & Press", "strength", ["Hinge and pull the weights up to the shoulders", "Dip the knees and press overhead", "Lower with control"], "Curling the weights up instead of using the hips.", ["full body", "shoulders"], pattern="full", equipment=["db"]),
    # --- pull-up bar ---
    ex("dead-hang", "Dead Hang", "strength", ["Overhand grip, arms straight", "Shoulders gently pulled down", "Breathe and hold"], "Kicking or swinging.", ["grip", "shoulders", "lats"], pattern="pull", mode="time", equipment=["bar"], harder="scapular-pull-up", position="hanging"),
    ex("scapular-pull-up", "Scapular Pull-Up", "strength", ["Hang with straight arms", "Pull shoulder blades down and back to lift a little", "Lower slowly"], "Bending the elbows.", ["lats", "shoulder blades"], pattern="pull", equipment=["bar"], easier="dead-hang", harder="negative-pull-up", position="hanging"),
    ex("negative-pull-up", "Negative Pull-Up", "strength", ["Jump or step up so your chin is over the bar", "Lower yourself over 5 seconds", "Reset and repeat"], "Dropping fast at the bottom.", ["lats", "biceps"], pattern="pull", equipment=["bar"], easier="scapular-pull-up", harder="pull-up", position="hanging"),
    ex("pull-up", "Pull-Up", "strength", ["Overhand grip, just wider than shoulders", "Pull your chest toward the bar", "Full hang at the bottom"], "Half reps and kipping.", ["lats", "biceps", "core"], pattern="pull", equipment=["bar"], easier="negative-pull-up", position="hanging"),
    ex("chin-up", "Chin-Up", "strength", ["Underhand grip, shoulder width", "Chin over the bar", "Lower all the way down"], "Craning the neck to reach the bar.", ["biceps", "lats"], pattern="pull", equipment=["bar"], easier="negative-pull-up", position="hanging"),
    ex("hanging-knee-raise", "Hanging Knee Raise", "strength", ["Hang still", "Curl knees up toward your chest", "Lower without swinging"], "Swinging for momentum.", ["abs", "grip"], pattern="core", equipment=["bar"], harder="hanging-leg-raise", position="hanging"),
    ex("hanging-leg-raise", "Hanging Leg Raise", "strength", ["Hang still, legs straight", "Lift legs to hip height or higher", "Control the way down"], "Swinging.", ["abs", "hip flexors", "grip"], pattern="core", equipment=["bar"], easier="hanging-knee-raise", position="hanging"),
    # --- HIIT / plyo ---
    ex("split-jump", "Split Jump", "hiit", ["Start in a lunge", "Jump and switch legs in the air", "Land softly back in a lunge"], "Landing with a stiff front knee.", ["legs", "power", "heart rate"], pattern="plyo", impact="high", lowImpactAlt="reverse-lunge"),
    ex("tuck-jump", "Tuck Jump", "hiit", ["Jump high", "Pull knees to chest", "Land softly and go again"], "Landing loud and stiff.", ["legs", "power", "heart rate"], pattern="plyo", impact="high", lowImpactAlt="air-squat"),
    ex("broad-jump", "Broad Jump", "hiit", ["Swing arms back, hinge", "Jump forward as far as you can", "Stick the landing, walk back"], "Knees caving on landing.", ["legs", "power"], pattern="plyo", impact="high", lowImpactAlt="air-squat"),
    ex("skaters", "Skaters", "hiit", ["Bound sideways onto one foot", "Back foot sweeps behind", "Touch down lightly and bound back"], "Landing with a straight knee.", ["legs", "glutes", "heart rate"], pattern="plyo", impact="high", lowImpactAlt="step-jacks"),
    ex("plank-jacks", "Plank Jacks", "hiit", ["High plank", "Jump feet wide and back together", "Hips stay level"], "Hips bouncing up and down.", ["core", "shoulders", "heart rate"], pattern="core", impact="high", lowImpactAlt="plank-shoulder-taps", position="prone"),
    ex("star-jumps", "Star Jumps", "hiit", ["Squat down a little", "Explode up into a star shape", "Land softly"], "Landing stiff-legged.", ["full body", "heart rate"], pattern="plyo", impact="high", lowImpactAlt="step-jacks"),
    ex("bear-crawl", "Bear Crawl", "hiit", ["Hands and feet, knees hovering an inch up", "Move opposite hand and foot together", "Keep your back flat"], "Hips high in the air.", ["shoulders", "core", "quads"], pattern="full", mode="time"),
    # --- yoga ---
    ex("mountain-pose", "Mountain Pose", "yoga", ["Feet hip-width, weight even", "Lengthen through the crown of the head", "Soft breath through the nose"], "Locking the knees.", ["posture", "balance"], pattern="yoga", mode="time", frames=["stand"], tempo=1),
    ex("tree-pose", "Tree Pose", "yoga", ["Foot on the inner calf or thigh (not the knee)", "Hands at heart or overhead", "Fix your gaze on one spot"], "Pressing the foot into the side of the knee.", ["balance", "hips", "ankles"], pattern="yoga", mode="time", perSide=True, frames=["tree"], tempo=1),
    ex("warrior-1", "Warrior I", "yoga", ["Long stance, back heel down at an angle", "Bend the front knee over the ankle", "Arms reach up, hips face forward"], "Front knee drifting inward.", ["legs", "hip flexors", "shoulders"], pattern="yoga", mode="time", perSide=True),
    ex("warrior-2", "Warrior II", "yoga", ["Wide stance, front knee over the ankle", "Arms out long, shoulders relaxed", "Gaze over the front hand"], "Leaning the torso over the front leg.", ["legs", "hips", "endurance"], pattern="yoga", mode="time", perSide=True, frames=["warrior2"], tempo=1),
    ex("triangle-pose", "Triangle Pose", "yoga", ["Wide stance, front leg straight", "Reach forward, then tip the hand down to shin or block", "Top arm reaches to the sky"], "Collapsing the side body.", ["hamstrings", "side body", "hips"], pattern="yoga", mode="time", perSide=True),
    ex("chair-pose", "Chair Pose", "yoga", ["Sit back like there's a chair", "Arms reach up alongside the ears", "Weight in the heels"], "Knees shooting past the toes with heels lifting.", ["quads", "glutes", "shoulders"], pattern="yoga", mode="time", frames=["chair_pose"], tempo=1),
    ex("low-lunge", "Low Lunge", "yoga", ["Back knee down, front knee over ankle", "Sink the hips forward", "Lift the chest, arms up if it feels good"], "Front knee way past the toes.", ["hip flexors", "quads"], pattern="yoga", mode="time", perSide=True, frames=["hip_flexor"], tempo=1, position="kneeling"),
    ex("pigeon-pose", "Pigeon Pose", "yoga", ["Front shin angled across the mat", "Back leg long behind you", "Fold forward if it feels good"], "Forcing it. Prop the hip on a pillow.", ["glutes", "hips"], pattern="yoga", mode="time", perSide=True),
    ex("cat-cow", "Cat-Cow", "yoga", ["Hands and knees", "Breathe in: drop the belly, lift the chest (cow)", "Breathe out: round the spine (cat)"], "Moving only the neck. Use the whole spine.", ["spine", "core"], pattern="yoga", mode="time", position="quadruped"),
    ex("boat-pose", "Boat Pose", "yoga", ["Sit tall, lean back slightly", "Lift the shins parallel to the floor", "Arms forward. Straighten legs to make it harder"], "Rounding the lower back.", ["core", "hip flexors"], pattern="yoga", mode="time", position="seated"),
    ex("thread-the-needle", "Thread the Needle", "yoga", ["From hands and knees, slide one arm under the other", "Rest shoulder and temple down", "Breathe into the upper back"], "Shifting the hips off center.", ["upper back", "shoulders"], pattern="yoga", mode="time", perSide=True, position="quadruped"),
    ex("supine-twist", "Supine Twist", "yoga", ["Lie on your back, hug one knee in", "Let it fall across your body", "Arms wide, both shoulders down"], "Forcing the knee to the floor.", ["spine", "glutes"], pattern="yoga", mode="time", perSide=True, position="supine"),
    ex("bridge-pose", "Bridge Pose", "yoga", ["Feet under knees, arms by your sides", "Lift hips and roll the chest open", "Breathe steadily"], "Knees splaying out.", ["glutes", "chest", "spine"], pattern="yoga", mode="time", frames=["bridge_up"], tempo=1, position="supine"),
    # --- stretches ---
    ex("figure-4-stretch", "Figure-4 Stretch", "stretch", ["On your back, ankle over the opposite knee", "Pull the bottom thigh toward you", "Keep the crossed foot flexed"], "Lifting your head and shoulders.", ["glutes", "piriformis"], pattern="flexibility", mode="time", perSide=True, position="supine"),
    ex("butterfly-stretch", "Butterfly Stretch", "stretch", ["Sit tall, soles of feet together", "Let the knees fall open", "Hinge forward gently"], "Bouncing the knees.", ["inner thighs", "hips"], pattern="flexibility", mode="time", position="seated"),
    ex("calf-stretch", "Wall Calf Stretch", "stretch", ["Hands on a wall, one foot back", "Back heel down, back leg straight", "Lean in until you feel the calf"], "Back heel lifting.", ["calves", "achilles"], pattern="flexibility", mode="time", perSide=True),
    ex("neck-stretch", "Neck Side Stretch", "stretch", ["Sit or stand tall", "Tip one ear toward the shoulder", "Let the other shoulder drop"], "Pulling hard on the head.", ["neck", "upper traps"], pattern="flexibility", mode="time", perSide=True),
    ex("brisk-walk", "Brisk Walk", "warmup", ["Walk at a pace where you can talk but not sing", "Swing the arms", "Tall posture"], "Hunching over a phone.", ["heart rate", "legs"], pattern="cardio", mode="time"),
    # --- pre & postnatal (DRAFT: pending pelvic-health PT review, SPEC 7a) ---
    ex("connection-breath", "Connection Breath", "prenatal", ["Breathe in: let ribs, belly and pelvic floor gently widen", "Breathe out: feel the pelvic floor and deep belly gently lift and draw in", "Keep it soft, about 30% effort"], "Bracing hard or holding your breath.", ["pelvic floor", "deep core", "diaphragm"], pattern="breath", mode="time", frames=["seated"], tempo=1, position="seated"),
    ex("pelvic-floor-lifts", "Pelvic Floor Lifts", "prenatal", ["Sit tall and breathe normally", "Gently lift and squeeze as if stopping gas and urine, hold 3 to 5 seconds", "Fully let go between reps. The relax matters as much as the lift"], "Squeezing glutes or thighs, or holding your breath.", ["pelvic floor"], pattern="pelvic", frames=["seated"], tempo=1, position="seated"),
    ex("pelvic-floor-quick-flicks", "Pelvic Floor Quick Flicks", "prenatal", ["Quick lift and squeeze", "Let go completely", "Repeat at a steady rhythm"], "Only half-relaxing between flicks.", ["pelvic floor"], pattern="pelvic", mode="time", frames=["seated"], tempo=1, position="seated"),
    ex("heel-slides", "Heel Slides", "prenatal", ["On your back, knees bent", "Breathe out, gently draw in the deep belly", "Slide one heel out slowly, then back"], "Lower back arching as the leg slides.", ["deep core"], pattern="core", perSide=True, frames=["bridge_down", "heel_slide_out"], tempo=1.4, position="supine"),
    ex("supine-pelvic-tilt", "Pelvic Tilts", "prenatal", ["On your back, knees bent", "Breathe out and gently flatten your back into the floor", "Breathe in and release"], "Pushing with the feet or lifting the hips.", ["deep core", "lower back"], pattern="core", position="supine"),
    ex("side-lying-clamshell", "Side-Lying Clamshell", "prenatal", ["Lie on your side, knees bent, heels together", "Lift the top knee without rolling the hips back", "Lower slowly"], "Rolling the top hip backward.", ["glutes", "hips"], pattern="hinge", perSide=True, position="sidelying"),
    ex("side-lying-leg-lift", "Side-Lying Leg Lift", "prenatal", ["Lie on your side, bottom knee bent", "Lift the top leg straight, toes forward", "Lower with control"], "Turning the toes up to the ceiling.", ["glutes", "outer hip"], pattern="hinge", perSide=True, position="sidelying"),
    ex("wall-squat", "Wall Squat", "prenatal", ["Back against a wall, feet a step forward", "Slide down to a comfortable depth", "Breathe out as you slide back up"], "Going deeper than feels comfortable.", ["quads", "glutes"], pattern="squat", frames=["wall_stand", "wall_sit"], tempo=1.3, props=[WALL]),
    ex("incline-plank", "Incline Plank", "prenatal", ["Hands on a counter or sturdy table", "Walk feet back to a straight line", "Breathe steadily, no straining"], "Holding your breath or bulging the belly.", ["core", "shoulders"], pattern="core", mode="time", frames=["incline_top"], tempo=1, props=[BOX]),
]

added = 0
for e in NEW:
    if e["id"] not in have:
        lib["exercises"].append(e)
        added += 1
(C / "exercises.json").write_text(json.dumps(lib, indent=1, ensure_ascii=False), encoding="utf-8")
print("exercises added:", added, "total:", len(lib["exercises"]))

# ---------- sessions ----------
sess = json.loads((C / "sessions.json").read_text(encoding="utf-8"))
for s in sess["sessions"]:
    s.setdefault("tracks", ["standard"])
have_s = {s["id"] for s in sess["sessions"]}


def item(exid, **kw):
    return {"ex": exid, **kw}


NEW_S = [
    {"id": "prenatal-strength", "name": "Prenatal Strength & Mobility", "type": "Prenatal", "tracks": ["prenatal"], "level": "any",
     "description": "Standing, seated and side-lying strength with breath work. No lying flat on your back, no jumping. Use the talk test: you should be able to hold a conversation.",
     "warmup": [item("march-in-place", sec=60), item("arm-circles", sec=40), item("hip-circles", sec=50), item("step-jacks", sec=40), item("cat-cow", sec=60), item("connection-breath", sec=50)],
     "main": {"format": "circuit", "rest": 30, "roundRest": 60, "maxRounds": 3, "items": [
         item("box-squat", reps=10), item("incline-push-up", reps=8), item("side-lying-clamshell", reps=10),
         item("bird-dog", reps=6), item("incline-plank", sec=20), item("pelvic-floor-lifts", reps=8)]},
     "cooldown": [item("kneeling-hip-flexor-stretch", sec=60), item("butterfly-stretch", sec=50), item("cat-cow", sec=50),
                  item("childs-pose", sec=50), item("cross-body-shoulder-stretch", sec=40), item("connection-breath", sec=50)]},
    {"id": "prenatal-mobility", "name": "Prenatal Mobility & Breath", "type": "Prenatal", "tracks": ["prenatal"], "level": "any",
     "description": "Gentle yoga-style flow for hips, back and pelvic floor. Stand near a wall for the balance poses.",
     "warmup": [item("march-in-place", sec=60), item("arm-circles", sec=40), item("hip-circles", sec=60), item("cat-cow", sec=70), item("connection-breath", sec=70)],
     "main": {"format": "flow", "roundRest": 20, "maxRounds": 3, "items": [
         item("cat-cow", sec=45), item("thread-the-needle", sec=60), item("low-lunge", sec=60), item("warrior-2", sec=60),
         item("tree-pose", sec=40), item("butterfly-stretch", sec=45), item("pelvic-floor-quick-flicks", sec=30), item("connection-breath", sec=45)]},
     "cooldown": [item("childs-pose", sec=60), item("cross-body-shoulder-stretch", sec=60), item("overhead-triceps-stretch", sec=60),
                  item("neck-stretch", sec=60), item("connection-breath", sec=60)]},
    {"id": "postpartum-reconnect", "name": "Postpartum Reconnect", "type": "Postpartum", "tracks": ["postpartum"], "phase": 1, "level": "any",
     "description": "Phase 1: breathing, pelvic floor and deep core. Gentle enough for the early weeks, once your provider says gentle movement is OK.",
     "warmup": [item("connection-breath", sec=90), item("march-in-place", sec=60), item("arm-circles", sec=50), item("hip-circles", sec=50), item("cat-cow", sec=50)],
     "main": {"format": "flow", "roundRest": 30, "maxRounds": 2, "items": [
         item("connection-breath", sec=45), item("pelvic-floor-lifts", sec=45), item("pelvic-floor-quick-flicks", sec=30),
         item("heel-slides", sec=60), item("supine-pelvic-tilt", sec=45), item("side-lying-clamshell", sec=60), item("bird-dog", sec=60)]},
     "cooldown": [item("childs-pose", sec=60), item("knees-to-chest", sec=60), item("cat-cow", sec=60), item("box-breathing", sec=60), item("cross-body-shoulder-stretch", sec=60)]},
    {"id": "postpartum-rebuild", "name": "Postpartum Rebuild", "type": "Postpartum", "tracks": ["postpartum"], "phase": 2, "level": "any",
     "description": "Phase 2: low-impact strength for legs, glutes, back and core. For after your provider has cleared you for exercise (usually around 6 weeks).",
     "warmup": [item("march-in-place", sec=60), item("arm-circles", sec=30), item("hip-circles", sec=30), item("cat-cow", sec=50), item("connection-breath", sec=40), item("glute-bridge", sec=40), item("scap-push-up", sec=50)],
     "main": {"format": "circuit", "rest": 25, "roundRest": 60, "maxRounds": 4, "items": [
         item("box-squat", reps=10), item("incline-push-up", reps=8), item("glute-bridge", reps=12), item("side-lying-clamshell", reps=12),
         item("bird-dog", reps=6), item("heel-slides", reps=8), item("pelvic-floor-lifts", reps=8)]},
     "cooldown": [item("kneeling-hip-flexor-stretch", sec=60), item("seated-hamstring-stretch", sec=50), item("figure-4-stretch", sec=60), item("childs-pose", sec=50), item("box-breathing", sec=80)]},
]
for s in NEW_S:
    if s["id"] not in have_s:
        sess["sessions"].append(s)
(C / "sessions.json").write_text(json.dumps(sess, indent=1, ensure_ascii=False), encoding="utf-8")
print("sessions:", [s["id"] for s in sess["sessions"]])
