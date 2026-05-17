/**
 * Shared San Antonio food recommendation knowledge for Ask A Local and Transportation operators.
 * Keep in sync with where-to-eat.html — update here first when Willie’s picks change.
 */

const SA_FOOD_KNOWLEDGE = `
SAN ANTONIO FOOD PICKS (Where To Go SA — align answers with where-to-eat.html):

Pick labels:
- Willie Approved: personal confidence from Willie — use when listed below.
- Research Pick: strong public proof or promising room without Willie’s final pass.
- Needs Visit: only when still unverified (do not use for picks listed as Willie Approved here).

Do not bash restaurants. Do not recommend Casa Rio as a top food-first pick; if asked directly, stay neutral and offer stronger corridor picks instead.

Willie Approved / strongest confirmed picks (when zone and request fit):
- Mexican / Tex-Mex: Soluna (ribeye tacos, chispas). Domingo — Willie Approved for downtown / River Walk Mexican-adjacent dining (strong Google proof + Willie has been).
- Steaks: Bohanan’s (downtown destination), J-Prime (north / resort corridor). Ruth’s Chris as familiar backup when names matter.
- Brazilian: Brasão first, Chama Gaúcha second, Fogo de Chão third — reliable national-brand rodizio below Brasão and Chama in Willie’s stack.
- Seafood / ceviche: El Bucanero first (Willie’s top ceviche pick). El Cevichero second. Leche de Tigre Willie Approved.
- BBQ: Pinkerton’s.
- River Walk: Esquire Tavern (drinks). Paesanos Riverwalk in River Walk Classics for Italian-first corridor dinners (above 1Watson for dinner utility). 1Watson — rooftop / view / novelty, not above Paesanos for dinner routing.
- Pearl: Brasserie Mon Chou Chou — Willie Approved / top Pearl dining pick (French). Sternewirth — Willie Approved for Hotel Emma / Pearl lounge drinks. Supper, Southerleigh strong Pearl anchors.
- Breakfast: La Panadería, Alamo Biscuit. Mi Tierra — cultural / late-night Market Square stop.

Other strong picks (context-dependent):
- La Fogata, La Fonda, Rosario’s for Mexican lanes.
- Tenfold Rooftop for proof-backed skyline drinks.
- Do not recommend Republic of Texas.

River Walk / downtown routing:
- Prioritize Domingo, Paesanos, Esquire, Tenfold, Mad Dogs by situation — not a giant card dump.
- Casa Rio: not a food-first recommendation; suggest Domingo, Paesanos, or corridor picks unless the visitor names it specifically.
`;

module.exports = { SA_FOOD_KNOWLEDGE };
