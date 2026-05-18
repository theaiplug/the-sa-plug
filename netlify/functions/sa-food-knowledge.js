/**
 * Shared San Antonio food recommendation knowledge for Ask A Local and Transportation operators.
 * Keep in sync with where-to-eat.html and resort-food.html (JW Marriott / TPC and La Cantera zones) when picks change.
 */

const SA_FOOD_KNOWLEDGE = `
SAN ANTONIO FOOD PICKS (Where To Go SA — align answers with where-to-eat.html):

Pick labels (visitor-facing only):
- Willie Approved: personal confidence from Willie — use when listed below.
- Strong Pick: high-confidence room with strong public proof.
- Local Favorite: strong neighborhood or situational favorite when it fits.
- Reliable Pick: safe visitor pick when proof is steady but not a headline room.
- Visitor-Friendly Pick, River Walk Classic, Pearl Favorite, Business Dinner Pick, Family-Friendly Pick, Patio Classic, Also Useful: use when they match the situation.

Never use internal QA labels: Needs Visit, "Willie hasn't visited," Research Pick as a dismissive frame, or "lower proof" wording.

Tone:
- Do not bash restaurants. Stay neutral and constructive.
- Do not recommend Casa Rio as a first-choice food pick. If asked, stay neutral — better food-first picks usually exist for visitors who care about the meal, not the postcard.
- When confidence is softer, say "worth checking current hours" or offer a stronger nearby pick.

Willie Approved / strongest confirmed picks (when zone and request fit):
- Mexican / Tex-Mex: Soluna (ribeye tacos, chispas). Domingo — Willie Approved for downtown / River Walk Mexican-adjacent dining. La Fogata — Willie Approved patio classic north of downtown.
- Steaks: Bohanan's (downtown destination), J-Prime (north / resort corridor). Ruth's Chris as familiar backup when names matter.
- Brazilian: Brasão first (Willie Approved top pick), Chama Gaúcha second, Fogo de Chão third — familiar national-brand rodizio below Brasão and Chama in Willie's stack.
- Seafood / ceviche: El Bucanero first (Willie's top ceviche pick). El Cevichero second. Leche de Tigre Willie Approved.
- BBQ: Pinkerton's.
- River Walk: Esquire Tavern (drinks, Willie Approved). Paesanos Riverwalk in River Walk Classics for Italian-first corridor dinners (above 1Watson for dinner utility). 1Watson — Also Useful / skyline view option, not above Paesanos for dinner routing.
- Pearl: Brasserie Mon Chou Chou — Willie Approved / top Pearl dining pick (French). Sternewirth — Willie Approved for Hotel Emma / Pearl lounge drinks. Supper, Southerleigh strong Pearl dinners.
- Breakfast: La Panadería, Alamo Biscuit. Mi Tierra — cultural / late-night Market Square stop.

Other strong picks (context-dependent):
- La Fonda, Rosario's for Mexican rooms.
- Tenfold Rooftop for proof-backed skyline drinks.
- Mad Dogs British Pub for informal River Walk pub pacing.
- Do not recommend Republic of Texas.

River Walk / downtown dinner routing:
- Lead with Domingo for polished Mexican-adjacent downtown energy, Paesanos for Italian-first River Walk dinners, Esquire and Tenfold for drinks depth, Mad Dogs for pub pacing — match the pick to the group's mood.
- For River Walk Mexican: prioritize convenience, walk time, and the kind of night they want. If the table matters more than the postcard, compare River Walk classics with downtown Mexican picks before committing.
- If a visitor names a famous River Walk spot you do not lead with, stay neutral and offer Domingo, Paesanos, or the corridor picks above that fit their situation.

Downtown / food language for operators:
- Use starting point, dinner pick, first stop, next move, backup pick, timing, and walk time — not anchor, lane, proof stack, deck, or routing logic.

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
- Chama Gaúcha — Willie Approved Brazilian rodizio (Stone Oak)
- Eddie V's — polished seafood and steak (Stone Oak)
- Blu Prime — upscale steak and seafood (Stone Oak)
- Palenque Grill — polished Mexican, groups (Stone Oak / North 281)
- Stone Terrace Gastropub — cozy New American, brunch, cocktails (Stone Oak)
- Smokey Mo's BBQ — quick Texas barbecue (Far North / TPC Parkway)
- 54th Street Scratch Grill & Bar — eclectic crowd-pleaser, families (Stone Oak)

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

La Cantera activities (when they ask what to do):
- Topgolf San Antonio — groups, date nights, sports fans (Google: 4.6 ★ · 6.8K reviews)
- Andretti Indoor Karting & Games — teens, rainy days, high-energy groups (Google: 4.6 ★ · 5.2K reviews)
- The Shops at La Cantera — shopping, strolling, open-air dining
- The Rock at La Cantera / Frost Plaza — events, concerts, pre/post dinner (check event calendar)
- Six Flags Fiesta Texas — families, thrill seekers, full-day plan
`;

module.exports = { SA_FOOD_KNOWLEDGE };
