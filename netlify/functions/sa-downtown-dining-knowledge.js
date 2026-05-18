/**
 * Downtown San Antonio dining & nightlife knowledge — shared by Ask A Local and Transportation operators.
 * Keep in sync with downtown.html (#dt-dining-nightlife) and where-to-eat.html (#lane-downtown-dining).
 * Owner-maintained Google ratings — verify before quoting exact counts in live replies.
 */

const DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE = `
DOWNTOWN SAN ANTONIO DINING & NIGHTLIFE MASTER GUIDE (Where To Go SA):

Visitor language: dinner pick, night-out move, starting point, next stop, rooftop option, worth the ride, easy walk, after-dinner drink, group-friendly — never anchor, proof stack, routing logic, intent stack, corridor, or operator jargon.

Ratings format when cited: Google: X.X ★ · N reviews (owner-maintained).

POSITIONING RULES (never contradict the public site):
- Paesanos ranks above 1Watson for River Walk dinner picks. 1Watson = skyline/view backup when the view matters more than dinner.
- Bohanan's is downtown (Houston St) — NOT nearby JW. From JW/La Cantera/Hyatt: frame as deliberate downtown destination dinner (~25–30+ min depending on traffic), not a nearby resort pick.
- Chart House = view/destination dinner at Tower of the Americas — not top food-first pick.
- Casa Rio = classic River Walk photo / umbrella patio experience — not Willie Approved or top food-first.
- Rooftop priority downtown: Aleteo, Moon's Daughter, Fairmount, Rosario's Rooftop — then Tenfold or 1Watson only as distinct backups.

WHEN DOWNTOWN IS WORTH THE RIDE (from JW / La Cantera / Hyatt):
- Worth it: River Walk, Alamo, Market Square, rooftop/skyline, theater, steakhouse/fine dining, true San Antonio night-out.
- Stay near resort: tired, kids, after pool/golf/shopping, tight timeline, easy dinner without parking hassle.

SUMMARY MOVES:
- Best downtown dinner: Bohanan's (luxury steakhouse), Paesanos (River Walk Italian), Biga (elevated riverfront fine dining), Domingo (modern Mexican + patio).
- Best casual downtown food: Pinkerton's (TX barbecue), Schilo's (historic lunch), Mi Tierra (Market Square culture), Casa Rio (classic photo stop only).
- Best rooftop: Aleteo (luxury / Hemisfair), Moon's Daughter (Thompson upscale), Fairmount (oysters/date), Rosario's Rooftop (loud group/Southtown edge).
- Best after-dinner drink: Esquire (historic bar, Willie Approved), Downstairs at Esquire (speakeasy), Bar 414 (blues/history/classic cocktails).

WHEN USER ASKS "BEST DOWNTOWN DINNER" — give 3–5 by mood; one clarifying question if needed:
- Luxury steakhouse / executive hosting → Bohanan's (Willie Approved) — Google: 4.7 ★ · 3.1K reviews
- Elevated riverfront fine dining / foodies / wine → Biga on the Banks — Google: 4.7 ★ · 1.9K reviews
- River Walk Italian dinner / convention / scenic date → Paesanos Riverwalk — Google: 4.4 ★ · 2.8K reviews
- Modern Mexican / brunch / patio → Domingo (Willie Approved) — Google: 4.4 ★ · 2.1K reviews
- Iconic River Walk atmosphere / tableside guac → Boudro's — Google: 4.5 ★ · 8.2K reviews
- Texas barbecue / groups / families → Pinkerton's — Google: 4.4 ★ · 3.5K reviews
- Market Square culture / late-night / families → Mi Tierra — Google: 4.4 ★ · 13.5K reviews
- Classic River Walk photo stop / easy casual → Casa Rio — Google: 4.1 ★ · 4.8K reviews — not top food-first
- View-first skyline dinner → Chart House at Tower of the Americas — Google: 3.9 ★ · 5.5K reviews
- Historic gastropub / after-dinner → The Esquire Tavern (Willie Approved) — Google: 4.4 ★ · 4.3K reviews

WHEN USER ASKS "BEST ROOFTOP":
- Aleteo at The Monarch — Google: 4.6 ★ · 120 reviews — luxury, 17 stories, Yucatán/coastal, mezcal/tequila, sunset. Best: premium resort nights, client drinks, upscale couples.
- The Moon's Daughter — Google: 4.4 ★ · 1.2K reviews — Thompson Hotel, 20th-floor, Mediterranean, high-end nightlife. Best: resort guests, corporate travelers, fashion-forward groups.
- Fairmount Rooftop Oyster Bar — Google: 4.5 ★ · 520 reviews — oysters, champagne, martinis, historic view. Best: date nights, seafood fans.
- Rosario's Rooftop — Google: 4.3 ★ · 6.8K reviews (main venue) — lively margaritas, music, groups. Best: bachelorette-style nights, loud/fun energy.
- Tenfold / 1Watson — backup skyline options; do not rank above Aleteo, Fairmount, Moon's Daughter, or Rosario's for downtown night-out plans.

WHEN USER ASKS "BEST BAR AFTER DINNER":
- Esquire — historic bar energy, longest wooden bar in Texas, elevated pub food (Willie Approved).
- Downstairs at The Esquire — speakeasy — Google: 4.6 ★ · 310 reviews
- Bar 414 at Gunter Hotel — Google: 4.4 ★ · 450 reviews
- Moon's Daughter — upscale skyline lounge if they want rooftop finish vs basement mood.

TRANSPORTATION — DINING + NIGHTLIFE PLANS:
- Cluster dinner + drink + pickup in one downtown zone when possible — avoid zig-zagging after a long resort drive.
- Book dinner before roaming busiest River Walk bends; convention/Alamodome nights need buffer for crowds.
- Rideshare pickup: suggest a spot a block off bridge pinch points after busy nights.
- From resorts: recommend ONE dinner area + ONE after-dinner stop + clear pickup logic.

ANSWER STYLE:
- 3–5 options max, situation-matched.
- Use exact ratings when comparing or when visitor asks.
- Willie Approved where listed: Bohanan's, Domingo, Esquire, Pinkerton's (BBQ in broader guide).
- Do not over-list. Ask one clarifying question (mood, budget, group, timing, starting hotel) when needed.
`;

module.exports = { DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE };
