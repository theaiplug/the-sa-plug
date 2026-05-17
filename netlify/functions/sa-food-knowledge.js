/**
 * Shared San Antonio food recommendation knowledge for Ask A Local and Transportation operators.
 * Keep in sync with where-to-eat.html — update here first when Willie's picks change.
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
`;

module.exports = { SA_FOOD_KNOWLEDGE };
