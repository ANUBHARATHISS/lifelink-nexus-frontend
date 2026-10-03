# LifeLink Nexus - what every screen and button does

Run: `npm install` then `npm run dev` (open the printed localhost link).

## Where things live
| File | Job | Backend phase |
|---|---|---|
| `src/engine.js` | The decision logic (filter, score, explain, priority, wave plan) | Rewritten in Java (`MatchEngine`, `UrgencyScorer`, `WavePlanner`) |
| `src/store.js` | Fake database + actions | MySQL + REST API + Axios calls |
| `src/Hospital.jsx` | Hospital screen | Stays; calls the API |
| `src/Donor.jsx` | Donor screen | Stays; calls the API |

## Hospital Portal
| Button / element | What it does now | What the backend will do later |
|---|---|---|
| **Find donors** | Saves the request, opens the recommendations screen | `POST /api/requests` stores it in MySQL, returns ranked donors |
| **Priority score card** | Context-based urgency (urgency + time + scarcity + units) | `UrgencyScorer` in Java |
| **Notify recommended donors** | Notifies the smallest group with ~90% chance to fill the units | `WavePlanner` + Spring Mail sends emails |
| **Notify** (one donor) | Marks donor Notified | `POST /api/requests/{id}/notify` + email |
| **Notify again** | Re-sends, shows "sent 2x" | Same endpoint; count saved in DB |
| **Show score breakdown** | Shows points per factor (Explainable AI) | API returns the factor list |
| **Confirm donation** | Marks Donated; other notified donors Stand down | `PATCH` updates history, resets donor's 90/120-day clock |
| **Filtered out list** | Shows who was excluded and why | API returns the `excluded` list |
| **Start a new request** | Clears everything | Not needed (each request is a DB row) |

## Donor App
| Button | What it does now | Backend later |
|---|---|---|
| **Signed in as** dropdown | Switches which donor you are | Real login: Spring Security + JWT |
| **Accept** | Status Accepted; hospital sees it | `PATCH /api/responses` + response history |
| **Decline** | Status Declined | Same; lowers future response rate |

## Not built yet (next phases)
Login/roles, admin analytics, real notifications, chatbot, trained acceptance model, MySQL.
