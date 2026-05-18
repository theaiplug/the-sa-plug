/**
 * Shared San Antonio food recommendation knowledge for Ask A Local and Transportation operators.
 * Keep in sync with where-to-eat.html and resort-food.html (JW Marriott / TPC, La Cantera, and Hyatt Hill Country zones) when picks change.
 */

const SA_FOOD_KNOWLEDGE = `
SAN ANTONIO FOOD PICKS (Where To Go SA — align answers with where-to-eat.html):

VISITOR QUESTIONS TO ASK FIRST (do not sound like an internal routing system):
- Where are you starting? (downtown / River Walk, Pearl, La Cantera, JW Marriott / TPC, Hyatt Hill Country / SeaWorld)
- How far do you want to drive?
- Is this family, business, date night, or late-night?
- Do you want easy, memorable, or local?

Pick labels (visitor-facing only):
- Willie Approved: personal confidence from Willie — use when listed below.
- Strong Pick: high-confidence room with strong public ratings.
- Local Favorite: strong neighborhood or situational favorite when it fits.
- Reliable Pick: safe visitor pick when ratings are steady but not a headline room.
- Visitor-Friendly Pick, River Walk Classic, Pearl Favorite, Business Dinner Pick, Family-Friendly Pick, Patio Classic, Also Useful: use when they match the situation.

Never use internal QA labels: Needs Visit, "Willie hasn't visited," Research Pick as a dismissive frame, or "lower proof" wording.
Never use: corridor, routing (except travel route), sequence, proof stack, intent stack, utility (as jargon), pacing (as jargon).

Tone:
- Do not bash restaurants. Stay neutral and constructive.
- When confidence is softer, say "worth checking current hours" or offer another nearby pick that fits the mood.

AVOID recommending as best food picks:
- Casa Rio — only for classic River Walk umbrella photo / historic patio experience, not top food-first.
- Republic of Texas — do not recommend.

AREA-FIRST PICKS (match starting zone before listing the whole city):

DOWNTOWN / RIVER WALK:
- Bohanan's (Willie Approved steak) — Google: 4.7 ★ · 3.1K reviews
- Biga on the Banks — Google: 4.7 ★ · 1.9K reviews
- Paesanos Riverwalk — Google: 4.4 ★ · 2.8K reviews
- Domingo (Willie Approved modern Mexican) — Google: 4.4 ★ · 2.1K reviews
- Boudro's (River Walk seafood) — Google: 4.5 ★ · 8.2K reviews
- Pinkerton's Barbecue — Google: 4.4 ★ · 3.5K reviews
- Mi Tierra (culture / Market Square) — Google: 4.4 ★ · 13.5K reviews
- Esquire Tavern (Willie Approved drinks) — Google: 4.4 ★ · 4.3K reviews
- Rooftops (ranked): Aleteo (Monarch), Fairmount Rooftop Oyster Bar, The Moon's Daughter (Thompson), Rosario's Rooftop — Tenfold / 1Watson as skyline backups only

THE PEARL:
- Supper — Google: 4.6 ★ · 1.5K reviews
- Southerleigh — Google: 4.5 ★ · 4.2K reviews
- Sternewirth (Willie Approved drinks; Research Pick if confirming visit) — Google: 4.8 ★ · 1.6K reviews
- Jazz, TX — Google: 4.8 ★ · 1.1K reviews
- Pullman Market — Google: 4.5 ★ · 650 reviews
- Pearl Farmers Market — Google: 4.8 ★ · 12K reviews
- Stable Hall — Google: 4.6 ★ · 400 reviews
- Brasserie Mon Chou Chou (Willie Approved French)

LA CANTERA / THE RIM:
- Signature Restaurant — Google: 4.7 ★ · 720 reviews
- Haywire — Google: 4.6 ★ · 1.2K reviews
- Perry's Steakhouse — Google: 4.7 ★ · 1.8K reviews
- Palenque Grill La Cantera — Google: 4.5 ★ · 2.1K reviews
- Whiskey Cake — Google: 4.5 ★ · 4.8K reviews
- Roca & Martillo — Google: 4.5 ★ · 300 reviews
- Brasão (Willie Approved rodizio) — La Cantera area, not JW Stone Oak default

JW MARRIOTT / TPC — on-property first:
- 18 Oaks — Google: 4.6 ★ · 920 reviews
- Cibolo Moon — Google: 4.4 ★ · 1.4K reviews
- High Velocity — Google: 4.3 ★ · 780 reviews
- Crooked Branch — Google: 4.5 ★ · 120 reviews
Stone Oak upgrades (short rideshare, not on JW property): J-Prime (Willie Approved), Chama Gaúcha (Willie Approved), Stone Terrace, Smokey Mo's — NOT Brasão as JW nearby (Brasão is La Cantera area).

HYATT HILL COUNTRY / SEAWORLD — on-property first:
- Antlers Lodge — Google: 4.5 ★ · 450 reviews
- Springhouse Café — Google: 4.2 ★ · 600 reviews
- Woodbine Bar — Google: 4.7 ★ · 120 reviews
Nearby: Via 313 — Google: 4.6 ★ · 1.2K reviews; Rudy's — Google: 4.6 ★ · 4.8K reviews; Pericos — Google: 4.4 ★ · 3.1K reviews

FOOD BY MOOD (curated — do not dump long citywide lists):
- Steakhouse: Bohanan's, J-Prime, Perry's, 18 Oaks, Antlers Lodge, Signature
- Mexican: Soluna (Willie Approved), Mi Tierra, Domingo, Palenque Grill, Pericos, La Fogata, La Fonda (light touch)
- Seafood / ceviche: El Bucanero (Willie Approved), El Cevichero, Boudro's, Fairmount Rooftop, Biga
- Barbecue: Pinkerton's, Rudy's, Smokey Mo's — do not over-list BBQ
- Italian / pizza: Paesanos, Roca & Martillo, Via 313, Grimaldi's
- Rooftop / drinks: Aleteo, Fairmount, Moon's Daughter, Rosario's Rooftop, Esquire, Bar 414, Sternewirth, Jazz TX
- Breakfast: La Panadería (Willie Approved), Alamo Biscuit, Cibolo Moon buffet (JW), Springhouse (Hyatt), Haywire brunch (La Cantera), Mi Tierra bakery culture

Willie Approved / strongest confirmed picks (when zone and request fit):
- Mexican / Tex-Mex: Soluna (ribeye tacos, chispas). Domingo — Willie Approved for downtown / River Walk Mexican-adjacent dining. La Fogata — Willie Approved patio classic north of downtown.
- Steaks: Bohanan's (downtown destination), J-Prime (north / resort corridor). Ruth's Chris as familiar backup when names matter.
- Brazilian: Brasão first (Willie Approved top pick), Chama Gaúcha second, Fogo de Chão third — familiar national-brand rodizio below Brasão and Chama in Willie's stack.
- Seafood / ceviche: El Bucanero first (Willie's top ceviche pick). El Cevichero second. Leche de Tigre Willie Approved.
- BBQ: Pinkerton's.
- River Walk: Esquire Tavern (drinks, Willie Approved). Paesanos Riverwalk for Italian-first River Walk dinners (above 1Watson for dinner picks). 1Watson — skyline view backup, not above Paesanos for dinner.
- Pearl: see PEARL_KNOWLEDGE — Supper, Southerleigh, Savor, Sternewirth (Willie Approved drinks), Jazz TX, Brasserie Mon Chou Chou (Willie Approved French). Pearl vs River Walk: Pearl for local-feeling chef rooms and Emma energy; River Walk for iconic water and first-timers.
- Breakfast: La Panadería, Alamo Biscuit. Mi Tierra — cultural / late-night Market Square stop.

Other strong picks (context-dependent):
- La Fonda, Rosario's for Mexican rooms.
- Tenfold Rooftop only when Aleteo / Fairmount / Moon's Daughter are not the fit — strong rating but lower priority than researched downtown rooftops.
- Mad Dogs British Pub for informal River Walk pub nights.
- Do not recommend Republic of Texas.

River Walk / downtown dinner picks (full downtown dining guide also in DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE):
- Lead with Domingo for polished modern Mexican downtown, Paesanos for Italian-first River Walk dinners (above 1Watson for dinner picks), Boudro's for iconic River Walk atmosphere, Biga for elevated riverfront fine dining, Bohanan's for luxury steakhouse (downtown destination — not nearby JW).
- Pinkerton's for downtown Texas barbecue; Mi Tierra for Market Square culture; Schilo's for historic lunch; Casa Rio for classic River Walk photo stop / easy casual River Walk option on the umbrellas — not a top food-first pick; do not present as best Mexican.
- Rooftops downtown: Aleteo (Monarch/Hemisfair luxury), Moon's Daughter (Thompson upscale), Fairmount Rooftop (oysters/date), Rosario's Rooftop (loud group energy). Chart House = view-first at Tower.
- After-dinner: Esquire (Willie Approved), Downstairs at Esquire (speakeasy), Bar 414 (blues/classic cocktails at Gunter).
- For River Walk Mexican / Tex-Mex: Domingo and Boudro's for stronger food-first nights; Mi Tierra for Market Square culture; Casa Rio only when they want the classic umbrella photo / easy casual River Walk experience.
- If a visitor names a famous River Walk spot you do not lead with, stay neutral and offer Domingo, Paesanos, Boudro's, or the picks above that fit their situation.

Downtown / food language for operators:
- Use starting point, dinner pick, first stop, next move, backup pick, timing, and walk time — not anchor, lane, proof stack, deck, corridor, or internal operator jargon.

RESORT_ZONE_KNOWLEDGE — JW MARRIOTT / TPC / FAR NORTH (separate from La Cantera / The Rim / Six Flags / UTSA northwest and from Hyatt Hill Country / SeaWorld):
- Property: JW Marriott San Antonio Hill Country Resort & Spa. Also: TPC San Antonio, River Bluff Water Experience, Lantana Spa, TPC Parkway, Stone Oak / North 281 nearby dinner access.
- Never merge with La Cantera / The Rim / Six Flags / UTSA northwest or Hyatt Hill Country / SeaWorld. Never say "JW Marriott La Cantera."
- If the visitor says "I'm at the JW," open with: "You're at JW Marriott / TPC / Far North San Antonio, so nearby dinner usually means the resort itself, TPC Parkway, North 281, or Stone Oak — not La Cantera or downtown unless you want a bigger outing."

JW on-property dining (align with resort-food.html — offer first for convenience):
- 18 Oaks — resort fine dining / steakhouse overlooking TPC courses (Strong Pick)
- Cibolo Moon — Tex-Mex and Southern comfort, family-friendly, tequila bar (Strong Pick)
- High Velocity — sports bar and grill, games and groups (Reliable Pick)
- Crooked Branch — lobby lounge, cocktails, Asian-fusion tapas (Strong Pick)
- Fiammé Pizzeria — quick resort pizza (Resort Pick)
- Replenish Spa Bistro — Lantana Spa light meals and wellness (Resort Pick)

JW nearby / Stone Oak / North 281 dinner (when leaving the resort bubble — not downtown-first):
- J-Prime — Willie Approved upscale steak (Stone Oak)
- Chama Gaúcha — Willie Approved Brazilian rodizio for JW / Stone Oak guests (strong Stone Oak backup to Brasão)
- Do NOT list Brasão as a JW nearby pick — Brasão is La Cantera / Rim area, closer to La Cantera resorts
- Eddie V's — polished seafood and steak (Stone Oak)
- Blu Prime — upscale steak and seafood (Stone Oak)
- Palenque Grill — polished Mexican, groups (Stone Oak / North 281)
- Stone Terrace Gastropub — Google: 4.5 ★ · 180 reviews — cozy New American, brunch, cocktails (Stone Oak)
- Smokey Mo's BBQ — Google: 4.4 ★ · 1.6K reviews — quick Texas barbecue (Far North / TPC Parkway)
- 54th Street Scratch Grill & Bar — Google: 4.3 ★ · 1.8K reviews — eclectic crowd-pleaser, families (Stone Oak)
- Do not leave JW guests feeling stuck with only casual nearby options — lead with J-Prime and Chama for stronger dinner nights when they will drive to Stone Oak

JW stay-nearby vs downtown:
- Stay on-property or Stone Oak / North 281 when: tired, with kids, after pool/golf/spa, tight timeline, or they want dinner without a long drive.
- Go downtown when: River Walk, Alamo, Market Square, rooftop, or a true San Antonio destination night is worth the ride.
- Do not call Bohanan's nearby to JW — downtown destination (~25–30 minutes depending on traffic).

JW activities when they ask what to do:
- River Bluff Water Experience — lazy river, slides, family pool days
- TPC San Antonio — championship golf
- Lantana Spa — spa and wellness reset
- Resort Activity Hub and Range Riders Kids' Club — family programming, s'mores, resort events

RESORT_ZONE_KNOWLEDGE — LA CANTERA / THE RIM / SIX FLAGS / UTSA NORTHWEST (separate from JW Marriott / TPC and from Hyatt Hill Country / SeaWorld):
- Zone includes: Signia by Hilton La Cantera Resort, Eilan Hotel, The Shops at La Cantera, The Rim, Six Flags Fiesta Texas, The Rock at La Cantera / Frost Plaza, UTSA northwest area.
- Never merge this zone with JW Marriott / TPC north-side or Hyatt Regency Hill Country / SeaWorld. Never say "JW Marriott La Cantera."
- If the visitor says La Cantera, Signia, Eilan, The Rim, Six Flags, Frost Plaza, or UTSA northwest, name the zone clearly first.
- Example opener: "You're in the La Cantera / The Rim / Six Flags / UTSA northwest area, so staying nearby can be a strong move if you want dinner without the downtown ride."

La Cantera stay-nearby vs downtown:
- Stay nearby when: tired from shopping, golf, pool, or Six Flags; kids need easier dinner; dinner is before/after resort activity; polished north-side meal without downtown parking/rideshare hassle.
- Go downtown when: River Walk, Alamo, Market Square, rooftop, or a true San Antonio night is worth the extra ride.
- For food near La Cantera, prioritize La Cantera-area picks first. Do not send downtown unless they want a destination dinner.

La Cantera restaurant suggestions (align with resort-food.html; public Google ratings may be cited when helpful):
- Signature Restaurant — fine dining / resort splurge (Resort Pick; Google: 4.7 ★ · 720 reviews)
- Haywire — Texas energy, business dinners, brunch (Strong Public Rating; Google: 4.6 ★ · 1.2K reviews)
- Roca & Martillo at The Rock — Frost Plaza / contemporary Italian (Visitor-Friendly Pick; Google: 4.5 ★ · 300 reviews)
- Palenque Grill La Cantera — polished Mexican, groups (Strong Public Rating; Google: 4.5 ★ · 2.1K reviews)
- Whiskey Cake Kitchen & Bar — scratch kitchen, brunch, cocktails (Local Favorite; Google: 4.5 ★ · 4.8K reviews)
- Perry's Steakhouse & Grille — classic steakhouse, business dinner (Business Dinner Pick; Google: 4.7 ★ · 1.8K reviews)
- Yard House — large groups, sports, late night (Family-Friendly Pick; Google: 4.4 ★ · 3.2K reviews)
- Grimaldi's Pizzeria — family pizza, shopping day (Family-Friendly Pick; Google: 4.4 ★ · 1.5K reviews)
- SweetFire Kitchen — in-resort dining at Signia, scenic casual (Resort Pick; Google: 4.2 ★ · 450 reviews)
- Brasão — Willie Approved top Brazilian rodizio (La Cantera / Rim area — NOT a JW / Stone Oak nearby pick; Google: 4.9 ★ · 10K reviews)

La Cantera activities (when they ask what to do):
- Topgolf San Antonio — groups, date nights, sports fans (Google: 4.6 ★ · 6.8K reviews)
- Andretti Indoor Karting & Games — teens, rainy days, high-energy groups (Google: 4.6 ★ · 5.2K reviews)
- The Shops at La Cantera — shopping, strolling, open-air dining
- The Rock at La Cantera / Frost Plaza — events, concerts, pre/post dinner (check event calendar)
- Six Flags Fiesta Texas — families, thrill seekers, full-day plan

RESORT_ZONE_KNOWLEDGE — HYATT HILL COUNTRY / SEAWORLD / WESTOVER HILLS / FAR WEST SIDE (separate from JW Marriott / TPC / Far North and from La Cantera / The Rim / Six Flags / UTSA northwest):
- Property: Hyatt Regency Hill Country Resort and Spa. Zone: 300-acre resort on San Antonio's Far West Side / Westover Hills; SeaWorld / Aquatica across the resort area; Culebra / Loop 1604 nearby dining; Windflower Spa; Hill Country Golf Club; Big Spring Lagoon; resort water park / lazy river / FlowRider.
- Never merge with JW Marriott / TPC / Stone Oak / North 281 or La Cantera / The Rim / Six Flags / UTSA northwest. Never say Hyatt La Cantera, JW Hyatt, JW Marriott La Cantera, or Hyatt near JW.
- If the visitor says "I'm at the Hyatt Hill Country," open with: "You're near Hyatt Hill Country / SeaWorld / Westover Hills on the Far West Side, so nearby plans usually mean the resort itself, SeaWorld, Culebra / 1604, or Far West Side dining — not JW, La Cantera, or downtown unless you want a bigger outing."

Hyatt on-property dining (offer first for convenience):
- Antlers Lodge — upscale Texas / steakhouse, romantic resort dinner (Resort Pick; Google: 4.5 ★ · 450 reviews)
- Springhouse Café — all-day resort casual, family-friendly (Family-Friendly Pick; Google: 4.2 ★ · 600 reviews)
- Aunt Di's Comfort Station — poolside / Big Spring Lagoon quick bites (Resort Pick; Google: 4.6 ★ · 80 reviews)
- Woodbine Bar — lobby lounge, craft cocktails, terrace (Strong Public Rating; Google: 4.7 ★ · 120 reviews)
- Charlie's Long Bar — Texas saloon, late-night resort bar (Visitor-Friendly Pick; Google: 4.4 ★ · 220 reviews)

Hyatt nearby / Westover Hills / Culebra / Loop 1604 (when leaving resort bubble — not downtown-first):
- Via 313 Pizza — Detroit-style pizza, Culebra Commons (Nearby Pick; Google: 4.6 ★ · 1.2K reviews)
- Rudy's "Country Store" and Bar-B-Q — Texas barbecue, large groups (Nearby Pick; Google: 4.6 ★ · 4.8K reviews)
- Pericos Mexican Restaurant — lively Tex-Mex, patio (Nearby Pick; Google: 4.4 ★ · 3.1K reviews)

Hyatt stay-nearby vs downtown:
- Stay on-property or Westover Hills / Culebra / 1604 when: tired, with kids, after SeaWorld, pool, spa, or golf, tight timeline, or easy dinner without a long drive.
- Go downtown when: River Walk, Alamo, Market Square, rooftop, or a true San Antonio destination night is worth the ride — one main stop, one dinner area, one return plan.
- Nearby dinner logic: Antlers Lodge for polished on-property dinner; Springhouse for easy family dining; Via 313, Rudy's, or Pericos when leaving resort without downtown.

Hyatt activities when they ask what to do:
- Resort water park / lazy river / FlowRider — family pool days (Google: 4.8 ★ · 2.1K reviews for water park section)
- Big Spring Lagoon — calmer lagoon / beach-style resort time (Google: 4.7 ★ · 150 reviews)
- SeaWorld San Antonio & Aquatica — major nearby attraction; pair with resort rest/pool breaks (Google: 4.5 ★ · 34K reviews)
- Windflower — The Hill Country Spa — couples, spa days (Google: 4.7 ★ · 350 reviews)
- Hill Country Golf Club — 27 holes, Toptracer bays (Google: 4.1 ★ · 990 reviews)
- Campfire Chats + Texas s'mores — resort evening tradition (check daily schedule)
- Rancher Hall + Toptracer — corporate / group events, not casual walk-up
- Six Flags Fiesta Texas — separate northwest outing for thrill days, not a quick Hyatt-side stop (Google: 4.6 ★ · 31K reviews)
- The Shops at La Cantera — separate northwest shopping/dining outing, not same zone as Hyatt (Google: 4.7 ★ · 11K reviews)
- Downtown River Walk / Alamo — planned destination night from Hyatt (Google: 4.7 ★ · 74K reviews for River Walk main trail)

If user asks about La Cantera from Hyatt: separate northwest outing — shopping, Six Flags, or dining — not Hyatt's immediate zone.
If user asks about SeaWorld: major nearby attraction across resort area; can pair with resort pool/nap breaks.
`;

module.exports = { SA_FOOD_KNOWLEDGE };
