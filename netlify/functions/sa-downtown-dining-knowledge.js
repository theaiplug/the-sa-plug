/**
 * Downtown San Antonio dining & nightlife knowledge — shared by Ask A Local and Transportation operators.
 * Keep in sync with downtown.html (#dt-dining-nightlife) and where-to-eat.html (#lane-downtown-dining).
 * Owner-maintained Google ratings — verify before quoting exact counts in live replies.
 */

const DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE = `
DOWNTOWN SAN ANTONIO DINING & NIGHTLIFE MASTER GUIDE (Where To Go SA):

Visitor language: dinner pick, night-out move, starting point, next stop, rooftop option, worth the ride, easy walk, after-dinner drink, group-friendly — never anchor, proof stack, routing logic, intent stack, corridor utility, operator layer.

Ratings format when cited: Google: X.X ★ · N reviews (owner-maintained).

POSITIONING RULES (never contradict the public site):
- Paesanos ranks above 1Watson for River Walk dinner utility. 1Watson = skyline/view/novelty backup.
- Bohanan's is downtown (Houston St) — NOT nearby JW. From JW/La Cantera/Hyatt: frame as deliberate downtown destination dinner (~25–30+ min depending on traffic), not a nearby resort pick.
- Chart House = view/destination dinner at Tower of the Americas — not top food-first pick.
- Aleteo / Rosario's rooftop ratings may reflect hotel/venue listings — cite carefully when comparing.

WHEN DOWNTOWN IS WORTH THE RIDE (from JW / La Cantera / Hyatt):
- Worth it: River Walk, Alamo, Market Square, rooftop/skyline, theater, steakhouse/fine dining, true San Antonio night-out.
- Stay near resort: tired, kids, after pool/golf/shopping, tight timeline, easy dinner without parking hassle.

SUMMARY MOVES:
- Best downtown dinner: Bohanan's (luxury steakhouse), Paesanos (River Walk Italian utility), Biga (elevated riverfront fine dining), Domingo (modern Mexican + patio).
- Best casual downtown food: Pinkerton's (TX barbecue), Schilo's (historic lunch), Mi Tierra (Market Square culture), Casa Rio (classic River Walk photo stop / easy casual on the umbrellas — not a top food-first pick).
- Best rooftop: Aleteo or Moon's Daughter (upscale skyline), Fairmount Rooftop (oysters/cocktails/date), Rosario's Rooftop (louder group/Southtown edge energy).
- Best after-dinner drink: Esquire (historic bar), Downstairs at Esquire (hidden speakeasy), Bar 414 (blues/history/classic cocktails), Moon's Daughter (upscale skyline lounge).

WHEN USER ASKS "BEST DOWNTOWN DINNER" — give 3–5 by mood; one clarifying question if needed:
- Luxury steakhouse / executive hosting → Bohanan's (Willie Approved) — Google: 4.7 ★ · 3.1K reviews · $100+ · Downtown/Houston St. Tip: cocktail at downstairs bar before upstairs dinner.
- Elevated riverfront fine dining / foodies / wine → Biga on the Banks — Google: 4.7 ★ · 1.9K reviews · $50-$100 · River Walk. Tip: river-view/terrace at sunset.
- River Walk Italian dinner utility / convention / scenic date → Paesanos Riverwalk — Google: 4.4 ★ · 2.8K reviews · $30-$60. Tip: Shrimp Paesano for first-timers. Above 1Watson for dinner utility.
- Modern Mexican / brunch / patio → Domingo (Willie Approved) — Google: 4.4 ★ · 2.1K reviews · $20-$50 · River Walk. Tip: lower river-level canopy patio when weather works.
- Iconic River Walk atmosphere / tableside guac → Boudro's — Google: 4.5 ★ · 8.2K reviews · $30-$60. Tip: outdoor river patio.
- Texas barbecue / groups / families → Pinkerton's — Google: 4.4 ★ · 3.5K reviews · $20-$40 · Houston St. Tip: duck/sausage jambalaya or jalapeño cheese sausage.
- Market Square culture / late-night / families → Mi Tierra — Google: 4.4 ★ · 13.5K reviews · $15-$30. Tip: panadería counter even if restaurant line is long.
- Historic lunch / root beer → Schilo's — Google: 4.5 ★ · 4.2K reviews · $15-$30 · Commerce St.
- Classic River Walk photo stop / easy casual / iconic umbrella patios → Casa Rio — Google: 4.1 ★ · 4.8K reviews · $15-$30. Not a top food-first pick; frame as historic classic experience, not best Mexican. Tip: request an outdoor table by the water when the photo matters more than the menu.
- View-first skyline dinner → Chart House at Tower of the Americas — Google: 3.9 ★ · 5.5K reviews · $50-$100 · Hemisfair. Book around sunset for view.
- Historic gastropub / after-dinner → The Esquire Tavern (Willie Approved) — Google: 4.4 ★ · 4.3K reviews · $20-$40 · Commerce St. Tip: back balcony over River Walk.

WHEN USER ASKS "BEST ROOFTOP":
- Aleteo at The Monarch — luxury, Hemisfair, mezcal/tequila, sunset — Google: 4.6 ★ · 120 reviews (venue/hotel rating — note if comparing).
- The Moon's Daughter — Thompson Hotel, upscale skyline lounge, Mediterranean small plates — Google: 4.4 ★ · 1.2K reviews.
- Fairmount Rooftop Oyster Bar — oysters, champagne, martinis, historic 1906 view — Google: 4.5 ★ · 520 reviews.
- Rosario's Rooftop — lively margaritas, groups, Southtown/downtown edge — Google: 4.3 ★ · 6.8K reviews (main venue rating unless rooftop-specific exists).
- Tenfold and 1Watson remain in broader SA food guide for Santo/skyline — downtown master guide prioritizes Aleteo, Moon's Daughter, Fairmount, Rosario's for downtown night-out plans.

WHEN USER ASKS "BEST BAR AFTER DINNER":
- Esquire — historic bar energy, longest wooden bar in Texas, elevated pub food.
- Downstairs at The Esquire — speakeasy under Esquire, intimate — Google: 4.6 ★ · 310 reviews.
- Bar 414 at Gunter Hotel — Robert Johnson history, classic cocktails — Google: 4.4 ★ · 450 reviews.
- Moon's Daughter — upscale skyline lounge if they want rooftop finish vs basement mood.

TRANSPORTATION — DINING + NIGHTLIFE PLANS:
- Cluster dinner + drink + pickup in one downtown zone when possible (River Walk spine, Market Square, Houston/Commerce bar row, Hemisfair/Tower) — avoid zig-zagging across downtown after a long resort drive.
- Book dinner before roaming busiest River Walk bends; convention/Alamodome nights need buffer for crowds.
- Rideshare pickup: suggest a spot a block off bridge pinch points after busy nights.
- River Walk + Market Square + Alamo: timing and walking vs rideshare between zones — do not promise rides or immediate availability.
- From resorts: if downtown is worth the ride, recommend ONE dinner area + ONE after-dinner stop + clear pickup logic.

ANSWER STYLE:
- 3–5 options max, situation-matched.
- Use exact ratings only when comparing or when visitor asks for proof.
- Willie Approved where listed: Bohanan's, Domingo, Esquire, Pinkerton's (BBQ in broader guide).
- Do not over-list. Ask one clarifying question (mood, budget, group, timing, starting hotel) when needed.
`;

module.exports = { DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE };
