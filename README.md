# Instructor Guide: Cut the Thrust

This guide is for instructors using the **Cut the Thrust: Clean vs Defective Aircraft** simulator
(in the Principles of Flight module) in class.

## What the app teaches

The simulator shows the four forces on an aircraft (lift, weight, thrust and drag) and what happens
when they stop being equal. Trainees learn that:

- When **thrust is less than drag**, the aircraft slows down. If the pilot does nothing, it then starts to sink.
- To **hold height** with less thrust, the wing must fly at a higher angle. That adds drag, so there is a limit.
- An aircraft can **swap height for speed**. In a descent, gravity makes up for missing thrust.
- **Airframe defects** (dirt, a raised repair patch, an open panel, a damaged leading edge, a mis-rigged flap,
  extra equipment) add drag, cut lift or add weight. The engine is fine, but the aircraft needs more thrust and fuel.
- **Each defect shows up as a symptom** the pilot can report, such as "slower cruise", "higher stall speed" or "buffet".
  Engineers work back from the symptom to find the defect.
- **Big defects cost the most.** Anything that disturbs a lot of air costs most. Small defects still add up over many flights.

A **Helicopter** button at the top gives the same lessons for a helicopter in the hover.

All numbers are teaching values, not real aircraft data.

## Before the lesson

- Open the app on the classroom computer: `index.html` → Principles of Flight → Cut the Thrust.
- The page needs no internet once it has loaded. Everything it uses is inside the page.
- **QR code:** when the page is hosted on a website, the start screen (Free Play) shows a QR code
  for the page. Tap it to make it bigger on the projector so trainees can open the app on their phones.
  If you open the page from a file on your computer, a phone can't reach it, so a note is shown instead of the code.
- Scores are kept only while the page is open. Nothing is saved or sent anywhere.

## The four parts used in these plans

| Part | Where to find it | What trainees do |
|------|------------------|------------------|
| **Predict First** | Training menu → 1. Predict First | Read a situation, guess which force changes most and what the pilot will report, then run the simulation to check. |
| **Compare mode** | Free Play → Compare mode button | Fly a clean aircraft beside a defective one with the same thrust. A results table and Pilot Report show the differences. |
| **Mystery Aircraft** | Training menu → 2. Mystery Aircraft | 1 to 3 hidden defects are switched on. Trainees read the Pilot Report, inspect areas of the aircraft and give a diagnosis. Fewer inspections earn bonus points. |
| **Fix & Verify** | Training menu → 3. Fix & Verify | Three defects are switched on. Trainees fix one at a time, re-run to check the gain, then rank the fixes from biggest gain to smallest. |

## 15-minute lesson plan

A quick lesson. You run the app on the projector and the class decides together.

| Time | Activity | What to do |
|------|----------|------------|
| 0–2 min | **Hook** | In Free Play, slide thrust from 60% to about 35% and press Play (No pilot input). Ask: "What is the aircraft doing, and why?" |
| 2–6 min | **Predict First** | Do two situations as a class. Take a show of hands for each answer before you press Run. Talk through the feedback. |
| 6–9 min | **Compare mode** | Back in Free Play, switch on "Misaligned or open panel" in Hangar Condition (Moderate). Turn on Compare mode and press Play. Point to the speed difference in the results table and read the Pilot Report aloud. |
| 9–13 min | **Mystery Aircraft** | Do one mystery aircraft as a class. Read the Pilot Report, let the class vote on which area to inspect, and try to use as few inspections as you can. |
| 13–15 min | **Wrap-up** | Ask discussion question 1 or 2 (below). Mention Fix & Verify as a follow-up. |

## 30-minute lesson plan

A fuller lesson. Trainees work in pairs on their phones (using the QR code) or on shared computers.

| Time | Activity | What to do |
|------|----------|------------|
| 0–3 min | **Hook** | Same as the 15-minute plan: cut the thrust in Free Play and ask what happens. Then try "Hold altitude" and ask why the aircraft still can't hold height for ever. |
| 3–10 min | **Predict First** | Pairs do 3–4 situations. Rule: both partners must agree on their answers before they press Run. Ask one pair to explain a situation they got wrong. |
| 10–16 min | **Compare mode** | On the projector, show three defects one at a time in Compare mode (a small one like dirt, the open panel, and extra equipment). For each one, pairs say which number in the results table changed most. |
| 16–23 min | **Mystery Aircraft** | Pairs solve two mystery aircraft. Ask them to write down their reasoning ("the report said buffet, so we inspected the panels first"). Share the highest score and how they got it. |
| 23–28 min | **Fix & Verify** | Pairs do one round. They must re-run after each fix and use the run log to rank the fixes. Ask: "Which fix would you do first if you only had time for one?" |
| 28–30 min | **Wrap-up** | Discuss 1–2 questions below. Optional: switch to Helicopter and show the same idea in the hover. |

## Discussion questions and model answers

**1. The pilot cuts the thrust and doesn't touch the controls. Why does the aircraft slow down first and then start to descend?**

Thrust is now less than drag, so the aircraft slows down. As it slows, the wing makes less lift. When lift drops below
weight, the flight path bends downward. The aircraft then settles into a steady descent where gravity makes up for the
missing thrust.

**2. The Pilot Report says "Engine parameters normal", but the aircraft burns more fuel. Where should the engineer look, and why?**

At the airframe. The engine is giving the thrust it should for its setting. The aircraft needs more thrust because
something on the airframe is adding drag (such as an open panel, a raised patch or dirt) or adding weight. Changing
engine parts would not fix it.

**3. With less thrust, the pilot raises the nose to hold height. Why can't they keep doing this for ever?**

Raising the nose increases the wing angle, which keeps lift equal to weight at a lower speed. But a higher wing angle
creates more drag (induced drag). At some point, flying slower only adds drag, so there isn't enough thrust to stay
level. The aircraft has to descend. The app shows this as "Cannot hold altitude".

**4. Why does extra equipment raise the stall speed, even though it adds very little drag?**

It adds weight. More weight needs more lift. To make more lift at the same speed, the wing must fly at a higher angle,
so it reaches its stall angle at a higher speed. The extra weight also slows the climb and adds a little drag.

**5. In Fix & Verify, dirt on the wing gives a small gain. Why is it still worth cleaning?**

The extra drag is small but is there on every flight. Over many flights, a small extra fuel burn adds up to a lot of
fuel and cost. Small defects also add together. Several "small" ones can cost as much as one big one.

## Seeing how the class did

Answers in Predict First, Mystery Aircraft and Fix & Verify are saved on each trainee's device and show up
under **My progress** on the portal. At the end of the lesson, ask trainees to add their name there and
download their progress file, then collect the files (for example through the LMS).

Open **Instructor** (`instructor.html`) and add the files to see the class at a glance: who has done what,
scores, the weakest topics and the questions most often missed, with details for each trainee. Use
**Try with sample class** to explore it before you have real files. The files are read in your browser only;
nothing is uploaded.

Saving progress works when the portal is served from a web host, and in Chrome or Edge when it is opened
from disk. Other browsers may not keep progress for files opened from disk.
