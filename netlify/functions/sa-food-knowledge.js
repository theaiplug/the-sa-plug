/**
 * Shared San Antonio food recommendation knowledge for Ask A Local and Transportation operators.
 * Keep in sync with where-to-eat.html — update here first when Willie’s picks change.
 */

const SA_FOOD_KNOWLEDGE = `
SAN ANTONIO FOOD PICKS (Where To Go SA — align answers with where-to-eat.html):

Pick labels (visitor-facing only):
- Willie Approved: personal confidence from Willie — use when listed below.
- Local Pick: strong neighborhood or situational favorite when it fits.
- Research Pick: strong public proof or a promising room still being validated — never say "Needs Visit," "Willie hasn't visited," or other internal QA language.
- Reliable Pick: safe visitor lane when proof is steady but not a headline pick.

Tone:
- Do not bash restaurants. Stay neutral and constructive.
- When confidence is lower, use Research Pick or say "worth checking current hours" — not dismissive "lower proof" wording.

Willie Approved / strongest confirmed picks (when zone and request fit):
- Mexican / Tex-Mex: Soluna (ribeye tacos, chispas). Domingo — Willie Approved for downtown / River Walk Mexican-adjacent dining (strong Google proof + Willie has been).
- Steaks: Bohanan's (downtown destination), J-Prime (north / resort corridor). Ruth's Chris as familiar backup when names matter.
- Brazilian: Brasão first, Chama Gaúcha second, Fogo de Chão third — reliable national-brand rodizio below Brasão and Chama in Willie's stack.
- Seafood / ceviche: El Bucanero first (Willie's top ceviche pick). El Cevichero second. Leche de Tigre Willie Approved.
- BBQ: Pinkerton's.
- River Walk: Esquire Tavern (drinks). Paesanos Riverwalk in River Walk Classics for Italian-first corridor dinners (above 1Watson for dinner utility). 1Watson — rooftop / view / novelty, not above Paesanos for dinner routing.
- Pearl: Brasserie Mon Chou Chou — Willie Approved / top Pearl dining pick (French). Sternewirth — Willie Approved for Hotel Emma / Pearl lounge drinks. Supper, Southerleigh strong Pearl anchors.
- Breakfast: La Panadería, Alamo Biscuit. Mi Tierra — cultural / late-night Market Square stop.

Other strong picks (context-dependent):
- La Fogata, La Fonda, Rosario's for Mexican lanes.
- Tenfold Rooftop for proof-backed skyline drinks.
- Mad Dogs British Pub for informal River Walk pub pacing.
- Do not recommend Republic of Texas.

River Walk / downtown dinner routing:
- Lead with Domingo for polished Mexican-adjacent downtown energy, Paesanos for Italian-first River Walk dinners, Esquire and Tenfold for drinks depth, Mad Dogs for pub pacing — match the lane to the group's mood.
- If a visitor names a famous River Walk spot you do not lead with, stay neutral and offer Domingo, Paesanos, or the corridor picks above that fit their situation.
`;

module.exports = { SA_FOOD_KNOWLEDGE };
