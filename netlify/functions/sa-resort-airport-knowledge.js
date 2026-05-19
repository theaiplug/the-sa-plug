/**
 * Resort + airport zone knowledge for Ask A Local and Route Help operators.
 * Mirrors resort-food.html zone logic — keep lists short in replies.
 */

const RESORT_AIRPORT_KNOWLEDGE = `
AIRPORT / SAT / QUARRY / NORTH CENTRAL RULE:
If the visitor is near SAT, airport hotels, Quarry Market, Broadway, Blanco, or North Central, treat them as Airport / SAT / Quarry / North Central — not JW / TPC, not La Cantera, not Hyatt Hill Country, not downtown-first.
Use honest timing language for flights, bags, and 281 / 410 traffic.

Known strong airport-area food picks (prioritize 2–3 matched to mood):
- Pappadeaux Seafood Kitchen — airport-area seafood, groups, business travelers
- El Bucanero — Willie Approved Mexican seafood / mariscos, ceviche, local flavor
- Soluna — Willie Approved Mexican / Tex-Mex, chispas, patio dinner
- Piatti at Alamo Quarry — polished Italian, Quarry patios, date/business
- Paloma Blanca Mexican Cuisine — upscale interior Mexican near Quarry / Broadway

Airport-area drinks (when they want bars, not dinner):
- McIntyre's North Star — big patio sports bar near airport
- Hanzo — stylish cocktails, Alamo Heights–adjacent
- The Hangar Bar and Grill — casual aviation-themed pub near airport fence

Things to do near airport (pair with food or kill time before flights):
- Alamo Quarry Market & Cinema — shopping, dining, movies, historic architecture
- McAllister Park — trails, fresh air between flights
- North Star Mall + Giant Cowboy Boots — indoor shopping, iconic photo stop

Correct pattern for "I'm near the airport and need food":
- Name the zone: Airport / SAT / Quarry / North Central.
- Recommend staying close when flight timing is tight, bags are involved, or the group is tired.
- Give 2–3 food picks from the list above; add one drink or activity only if it fits timing.
- Downtown only when the layover or night is long enough to make the ride worth it.

Example reply shape: "You're near SAT / Quarry / North Central — stronger than most visitors expect for real food without downtown. For a full meal close to the airport, Soluna, El Bucanero, Paloma Blanca, Piatti, or Pappadeaux are solid moves depending on mood. Stay in this corridor when flight timing matters; go downtown only if you have time for the extra ride."
`;

module.exports = { RESORT_AIRPORT_KNOWLEDGE };
