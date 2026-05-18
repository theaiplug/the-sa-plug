/**
 * Shared Downtown San Antonio activity knowledge for Ask A Local and Transportation operators.
 * Keep in sync with downtown.html when attractions, ratings, or tips change.
 */

const DOWNTOWN_ACTIVITY_KNOWLEDGE = `
DOWNTOWN SAN ANTONIO ACTIVITY GUIDE (Where To Go SA — align with downtown.html):

Visitor language: use starting point, first stop, downtown move, plan, area, next stop, backup option, worth the walk, worth the ride — never anchor, corridor, routing logic, proof stack, intent stack, or operator jargon unless the visitor uses those words.

Ratings format when cited: Google: X.X ★ · N reviews (owner-maintained; verify before quoting exact counts).

ANSWER STYLE:
- Lead with: "Here's the cleanest plan." / "Here's the easier area." / "Here's the better first move." / "Here's where I'd send you."
- 3–5 options max, matched to situation. One clarifying question only when needed (group, timing, hotel area, indoor vs outdoor, energy).

OPERATOR QUESTIONS — HOW TO ANSWER:

"What should I do downtown tonight?"
→ Infer: first time or repeat, group type, starting hotel area, dinner planned or not, heat/rain. Default first-timers: Alamo window + River Walk leg + one dinner pick. Add Tower or Market Square if energy remains. Convention: walkable cluster only.

"Where should we eat on the River Walk?"
→ Lead Bohanan's (luxury steak, Willie Approved), Biga (elevated riverfront), Paesanos (Italian, convention-friendly), Domingo (modern Mexican, Willie Approved), Boudro's (iconic tableside guac). Chart House = view-first at Tower, not top food-first. Casa Rio = classic photo/history patio only — not top food-first, not Willie Approved.

"What rooftop should we go to?"
→ Priority: Aleteo (Monarch, luxury sunset), Fairmount (oysters/date), Moon's Daughter (Thompson upscale), Rosario's Rooftop (lively groups). Do not lead with Tenfold or 1Watson unless visitor specifically wants a backup skyline option.

"Should we do Pearl or River Walk?"
→ Pearl: polished food, Hotel Emma drinks, farmers market weekends, calmer patios, chef-led dinner — better when they want local polish without River Walk crush. River Walk: iconic water, boats, first-timer postcard — better for classic San Antonio first visit. From resorts: frame Pearl as a planned dinner night (~20–30+ min), not "nearby."

"What can we do with kids downtown?"
→ Family day plan: Hemisfair/Yanaguana + Tower + River Walk loop + indoor backup. Indoor: LEGOLAND, SEA LIFE, LiggettVille (Rivercenter), Magik Theatre + Yanaguana, Hopscotch (teens), Briscoe (heat), Buckhorn (quirky history). Cluster indoors — do not zig-zag families across downtown.

"What should we do if it's too hot?"
→ Heat/rain backup: Hopscotch, Briscoe, LEGOLAND, SEA LIFE, LiggettVille, Buckhorn. Pair one indoor stop with a short outdoor leg, not a full outdoor marathon.

"We're here for a convention — what's easy?"
→ Walkable: Convention Center area → River Walk dinner (reservation first) → one rooftop or bar → easy return. Briscoe, Hopscotch, Buckhorn, Cathedral between sessions. Alamodome events: walking from downtown often beats event parking.

"Where should resort guests go downtown?"
→ Make downtown worth the ride: one main stop + one dinner area + one after-dinner walk. JW / La Cantera / Hyatt are not interchangeable — confirm zone first. Do not describe Bohanan's as "near" JW; it is a deliberate downtown destination dinner.

QUICK MOVES (match downtown.html quick-pick cards):
1. First time: Alamo → River Walk → dinner → optional Tower or Market Square.
2. Family day: Hemisfair/Yanaguana → Tower → River Walk → indoor backup.
3. Heat/rain: Hopscotch, Briscoe, LEGOLAND, SEA LIFE, LiggettVille, Buckhorn.
4. Culture loop: Market Square, Mi Tierra, San Fernando Cathedral, La Villita, Buckhorn.

FIRST-TIME STOPS (ratings on site):
- The Alamo — Google: 4.6 ★ · 150K reviews — timed entry for church sanctuary.
- San Antonio River Walk — Google: 4.7 ★ · 74K reviews.
- Tower of the Americas — Google: 4.5 ★ · 19K reviews.
- Historic Market Square / El Mercado — Google: 4.4 ★ · 8.2K reviews.
- Mi Tierra — Google: 4.4 ★ · 13.5K reviews — Market Square culture, late-night.

FAMILY / INDOOR:
- LEGOLAND — Google: 4.0 ★ · 2.0K reviews — younger kids.
- SEA LIFE — Google: 4.2 ★ · 1.5K reviews.
- LiggettVille — Google: 4.4 ★ · 850 reviews — active kids, Rivercenter.
- Magik Theatre — Google: 4.8 ★ · 450 reviews — pairs with Yanaguana.
- Hopscotch — Google: 4.7 ★ · 4.8K reviews — teens, heat escape.
- Briscoe — Google: 4.7 ★ · 2.1K reviews — midday heat, art.
- Buckhorn — Google: 4.6 ★ · 4.5K reviews — quirky Texas history.

CULTURE LOOP:
- San Fernando Cathedral — Google: 4.8 ★ · 4.2K reviews — Saga projection when running.
- La Villita — Google: 4.6 ★ · 1.8K reviews.
- Market Square — Google: 4.4 ★ · 8.2K reviews.
- Buckhorn — Google: 4.6 ★ · 4.5K reviews.
- Briscoe — Google: 4.7 ★ · 2.1K reviews.

EVENTS:
- Alamodome — Google: 4.4 ★ · 15.5K reviews — walking from downtown often easier than event traffic.

TRANSPORTATION NOTES (visitor language):
- Cluster stops by area; avoid zig-zagging families.
- Book dinner before busiest River Walk bends.
- Rideshare pickup a block off bridge pinch points.
- Museum Reach = quieter north River Walk extension toward Pearl.
`;

const { DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE } = require("./sa-downtown-dining-knowledge");

module.exports = { DOWNTOWN_ACTIVITY_KNOWLEDGE, DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE };
