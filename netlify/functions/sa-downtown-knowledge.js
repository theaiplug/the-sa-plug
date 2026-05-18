/**
 * Shared Downtown San Antonio activity knowledge for Ask A Local and Transportation operators.
 * Keep in sync with downtown.html activity cards when attractions, ratings, or tips change.
 */

const DOWNTOWN_ACTIVITY_KNOWLEDGE = `
DOWNTOWN SAN ANTONIO ACTIVITY GUIDE (Where To Go SA — align with downtown.html):

Visitor language: use starting point, first stop, downtown move, plan, area, next stop, backup option, worth the walk, worth the ride — never anchor, corridor, routing logic, proof stack, intent stack.

Ratings format when cited: Google: X.X ★ · N reviews (owner-maintained; verify before quoting exact counts).

SUMMARY MOVES (use when visitors need a fast plan):
- Best first-time downtown move: Alamo + River Walk + Tower of the Americas; add Market Square or La Villita for more culture without a long drive.
- Best family downtown move: River Walk boat energy, then Rivercenter / LEGOLAND / SEA LIFE / LiggettVille / Magik Theatre / Hemisfair when kids need indoor time, shade, or reset.
- Best convention downtown move: keep it walkable — River Walk, Buckhorn, Hopscotch, Briscoe, San Fernando Cathedral, short dinner/drink options between sessions.
- Best resort guest downtown move: make downtown worth the ride — one main stop, one dinner area, one after-dinner walk.

WHEN USER ASKS "WHAT SHOULD I DO DOWNTOWN" — infer or ask briefly:
- first time or repeat?
- family, couple, convention, solo, group?
- daytime or night?
- heat/rain?
- walkable only or rideshare OK?
- dinner already planned?
Give 3–5 best options, not a dump. Use ratings only when comparing or helpful.

FIRST-TIME: Alamo (early) + River Walk leg + Tower or Market Square depending on timing and energy.
KIDS: River Walk boat / Tower plaza fountains / LEGOLAND / SEA LIFE / LiggettVille / Magik Theatre / Hemisfair-Yanaguana by age and weather.
CONVENTION: walkable cluster — Convention Center area, River Walk, Briscoe, Hopscotch, Buckhorn, San Fernando Cathedral; dinner reservation discipline.
RESORT GUEST (JW / La Cantera / Hyatt): one main attraction + one dinner area + one after-dinner walk; cluster by area — do not zig-zag families.
HOURS / TICKETS / SCHEDULES: share what you know, then tell them to verify on the official listing before committing.

CATEGORIES AND STOPS:

Historic / Culture:
- The Alamo — Historic Landmark, Downtown / Alamo Plaza, free grounds / timed entry for church sanctuary (Google: 4.6 ★ · 150K reviews). Reverent, historic. Best: first-timers, history, families. Tip: reserve timed entry online for church sanctuary.
- San Fernando Cathedral — Historic Landmark, Main Plaza, free (Google: 4.8 ★ · 4.2K reviews). Night stop when "San Antonio | The Saga" projection runs. Best: architecture, couples, free memorable moment.
- Buckhorn Saloon & Museum — Historic Museum & Bar, Houston St, tickets vary (Google: 4.6 ★ · 4.5K reviews). Quirky Texas saloon-museum. Best: families with wildlife interest, history, historic bar drink.
- La Villita Historic Arts Village — Arts & Culture, River Walk edge, free (Google: 4.6 ★ · 1.8K reviews). Quieter shops/galleries. Best: souvenirs, couples, avoiding River Walk crush. Tip: Marriage Island area for photos.
- Historic Market Square / El Mercado — Shopping & Culture, free (Google: 4.4 ★ · 8.2K reviews). Colorful, music, Mi Tierra energy. Best: families, cultural shopping, daytime. Tip: weekends = more music/vendors.
- Briscoe Western Art Museum — Museum, River Walk edge, tickets vary (Google: 4.7 ★ · 2.1K reviews). Calmer indoor Western art. Best: art/history, heat escape. Tip: outdoor sculpture garden by the river.

Walkable / Scenic:
- San Antonio River Walk — Linear park & hub, free walk / paid boat tours (Google: 4.7 ★ · 74K reviews). Classic bridges, patios, photos. Best: first-timers, scenic walks, families, convention walkability, evening drinks. Tip: quieter north toward Museum Reach vs busiest restaurant corridor.
- Tower of the Americas — Observation tower, Hemisfair, tickets vary (Google: 4.5 ★ · 19K reviews). Skyline/sunset. Best: families, dramatic stop. Tip: lower plaza fountains for kids before/after tower.
- Museum Reach — quieter River Walk extension north; good when crowds feel heavy downtown.
- Hemisfair / Tower plaza — green space, fountains, pairs with Magik Theatre and Tower.

Immersive / Modern:
- Hopscotch San Antonio — Interactive art, tickets vary (Google: 4.7 ★ · 4.8K reviews). Indoor lights/photos/cocktails. Best: teens, couples, heat/rain backup, groups wanting different.
- Briscoe — also a quieter indoor culture option on the river.
- Alamodome — Stadium & arena, east edge, tickets vary (Google: 4.4 ★ · 15.5K reviews). Sports, concerts, conventions. Tip: walking from downtown can beat event parking/traffic.

Family / Indoor / Rain:
- LiggettVille Adventure Center — Rivercenter, ropes/zip/climb, tickets vary (Google: 4.4 ★ · 850 reviews). Active kids, rainy days. Tip: check size/age rules.
- LEGOLAND Discovery Center — Rivercenter, younger kids (Google: 4.0 ★ · 2.0K reviews). Tip: combo with SEA LIFE if doing both.
- SEA LIFE Aquarium — Rivercenter (Google: 4.2 ★ · 1.5K reviews). Ocean tunnel, touch pools. Tip: check feeding/demo schedule.
- The Magik Theatre — Hemisfair, youth theatre (Google: 4.8 ★ · 450 reviews). Pair with Yanaguana Garden playground.
- Rivercenter area — cluster indoor family stops without zig-zagging.
- Hemisfair / Yanaguana Garden — playground reset with Magik or Tower.

Event + Convention:
- Alamodome — major events; downtown walk often easier than parking.
- Convention Center area — keep plans walkable to River Walk, Briscoe, Hopscotch, Buckhorn, Cathedral.
- Pickup/dropoff timing matters for Market Square, River Walk, Alamo, Tower — suggest spots a block off bridge crowds.

TRANSPORTATION OPERATOR DOWNTOWN ROUTING:
- From JW / La Cantera / Hyatt: help decide if downtown is worth the ride; if yes, cluster stops by area — Alamo plaza cluster, River Walk spine, Hemisfair/Tower, Market Square, Rivercenter indoors.
- Do not send families zig-zagging across downtown in one afternoon.
- Alamodome events: walking from downtown often beats fighting traffic/parking.
- Convention visitors: walkable, time-aware; dinner reservation before roaming busiest River Walk bends.
- Resort guests: one strong plan — example from La Cantera: "Make it worth the ride: Alamo if still open, River Walk for walk/boat energy, dinner or Market Square by time; with kids add Tower plaza or Rivercenter indoor stops for heat."
- Market Square, River Walk, Alamo, Tower: emphasize timing and pickup location away from bridge pinch points.
`;

const { DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE } = require("./sa-downtown-dining-knowledge");

module.exports = { DOWNTOWN_ACTIVITY_KNOWLEDGE, DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE };
