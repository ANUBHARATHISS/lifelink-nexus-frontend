# LifeLink Nexus

Emergency blood donor matching platform with explainable, rule-based decision support.
A machine-learning model for donor acceptance is planned.

> **Status: work in progress.** The React frontend prototype and the matching logic are complete (running on sample data). The Spring Boot backend, database, login and email notifications are not built yet.

## Problem

In an emergency, hospitals often search for blood donors manually. This is slow and can notify people who are incompatible, ineligible or far away. LifeLink Nexus recommends suitable donors quickly and explains why.

## What works today

**Hospital Portal**
- Create an emergency request (blood group, units, time limit, urgency)
- Priority score for the request, based on urgency, time window, blood group scarcity and units needed
- Donor ranking with a Match Score (0-100) and a plain-language reason for each donor
- Score breakdown per donor (distance, acceptance likelihood, recovery readiness, group match, fair rotation)
- Notification plan: the smallest group of top donors that gives about a 90% chance of getting the required units
- Notify, Notify again and Confirm donation actions
- A "Filtered out" list that shows who was excluded and why

**Donor App**
- Choose a donor to simulate, view the request, then Accept or Decline
- Shows the donor's last donation date and rest period

**Behaviour**
- After a donation is confirmed, the donor's rest period starts again and they are filtered out of the next request
- Demo tools: Skip 30 days and Reset demo data

## How the matching works

1. **Compatibility:** ABO/Rh rules remove donors whose blood group is unsafe for the patient.
2. **Eligibility:** donors are removed if unavailable, if they donated too recently, or if they are more than 25 km away.
3. **Scoring:** remaining donors get a weighted score. Distance matters more when the request is critical. Scarce universal donors (O-) are held back unless the case is critical. Donors who were asked often recently are ranked lower to share the load.
4. **Notification plan:** donors are added from the top of the ranking until the combined chance that enough of them accept reaches 90%.

All of this logic is in `lifelink-nexus-frontend/src/engine.js`.

## Run the frontend

Requires Node.js.

```bash
cd lifelink-nexus-frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Project structure

```
lifelink-nexus-frontend/
  src/
    main.jsx        entry point
    App.jsx         top-level component, app state (useReducer), tabs
    Hospital.jsx    Hospital Portal screen
    Donor.jsx       Donor App screen
    engine.js       matching, scoring, priority and notification-plan logic
    store.js        sample donor data and state reducer
    styles.css      styling
  FEATURES.md       what each button does now and what the backend will do later
```

## Tech

- **Now:** React, JavaScript (ES6), Vite, HTML5, CSS3
- **Planned:** Java, Spring Boot, Spring Data JPA, MySQL, Spring Security with JWT, Spring Mail

## Roadmap

- [x] React frontend prototype
- [x] Rule-based matching engine with explanations
- [ ] Spring Boot REST API (replace the sample data in `store.js`)
- [ ] MySQL database with Spring Data JPA
- [ ] Login and roles with JWT
- [ ] Email notifications
- [ ] Donor acceptance model trained on a public dataset
- [ ] Unit tests, deployment

## Limitations

- Sample data only. It lives in browser memory and resets when the page is refreshed.
- No backend, login or real notifications yet.
- Distances are stored values, not calculated from live locations.
- The donation rest periods (90 days for men, 120 for women) are placeholder values and must be replaced with local blood bank or WHO guidelines.
- The donor acceptance probability uses a hand-set formula, not a trained model.
- There is no automatic escalation to the next group of donors yet.
- This is a learning project and is **not for real medical use**.

