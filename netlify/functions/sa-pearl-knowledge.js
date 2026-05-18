/**
 * Pearl District knowledge for Ask A Local and Transportation operators.
 * Keep in sync with downtown.html (#dt-pearl-guide) and where-to-eat.html (#lane-pearl).
 */

const PEARL_KNOWLEDGE = `
PEARL DISTRICT GUIDE (Where To Go SA):

Positioning: The Pearl is a reimagined historic brewery district just north of downtown — one of San Antonio's best areas for dinner, drinks, boutique shopping, weekend markets, Hotel Emma, and a more local-feeling night out. Not the same as the busiest River Walk restaurant stretch.

Visitor language: Pearl night, dinner pick, farmers market morning, Hotel Emma drinks, worth the short ride north — never internal operator jargon.

Pearl vs River Walk tonight:
- Pearl: more local-feeling, chef-led rooms, Hotel Emma energy, farmers market weekends, calmer patios, better when the group wants polish without River Walk crush.
- River Walk: iconic water, boats, classic patios, convention walkability — better for first-timers who want the postcard walk.
- From resorts: Pearl is a planned dinner night (~20–30+ min from north/west resorts depending on traffic), not a "nearby" default.

WHEN USER ASKS "WHAT'S WORTH DOING AT PEARL" — give 3–5 by mood:
- Weekend morning: Pearl Farmers Market (arrive before 10 AM to ease parking) + Bottling Department Food Hall for mixed tastes.
- Dinner night: Supper (upscale business/celebration), Southerleigh (groups, brewery), Savor (foodie / CIA student-run), Brasserie Mon Chou Chou (Willie Approved French).
- Drinks: Sternewirth (Willie Approved Hotel Emma lounge), Jazz TX (live jazz date night), Blue Box Bar (casual patio happy hour).
- Walk / culture: Museum Reach River Walk extension, boutique stops (The Twig Book Shop, The Sporting District), Stable Hall for concerts/events.

PEARL DINING (owner-maintained Google ratings — verify before quoting exact counts):
- Supper — Google: 4.6 ★ · 1.5K reviews · $50–$100. Upscale business dinners, celebratory meals, romantic dates.
- Savor — Google: 4.5 ★ · 350 reviews. Foodies, affordable fine dining, CIA student-run experience.
- Southerleigh Fine Food & Brewery — Google: 4.5 ★ · 4.2K reviews. Southern comfort, seafood, house beer, groups.
- Boiler House Texas Grill & Wine Garden — Google: 4.3 ★ · 2.4K reviews. Steaks, wine, brunch, industrial Pearl atmosphere.
- Pullman Market — Google: 4.5 ★ · 650 reviews. Mixed tastes, food hall energy, market browsing.
- Brasserie Mon Chou Chou — Willie Approved top Pearl dining pick (French). Strong review depth.
- Sternewirth — Willie Approved · Google: 4.8 ★ · 1.6K reviews. Luxury cocktails, Hotel Emma lounge.
- Jazz, TX — Google: 4.8 ★ · 1.1K reviews. Date night, live music, underground jazz club.
- Blue Box Bar — Google: 4.4 ★ · 550 reviews. Casual cocktails, happy hour, patio energy.
- Ladino — Mediterranean variety when the group wants Pearl without default steakhouse names.

PEARL THINGS TO DO:
- Pearl Farmers Market — Google: 4.8 ★ · 12K reviews. Weekend mornings, pastries, local vendors. Tip: before 10 AM for parking.
- Bottling Department Food Hall — Google: 4.5 ★ · 830 reviews. Families, mixed tastes, fast casual.
- Museum Reach / River Walk Extension — Google: 4.7 ★ · 74K reviews (main trail). Couples, scenic walk, art installations.
- Stable Hall — Google: 4.6 ★ · 400 reviews. Concerts, corporate/social groups, live music.
- Boutique shopping: The Twig Book Shop, The Sporting District — local character stops.

PEARL FROM RESORT ZONES:
- Worth the ride when: one polished San Antonio dinner, Hotel Emma night, farmers market weekend, or Pearl-over-River-Walk mood.
- Stay near resort when: tired, kids need pool, tight timeline, or the group wants easy resort food instead of a second drive.

ANSWER STYLE for Pearl questions:
- 2–3 best options + why + one next move.
- Ask one short follow-up (group, timing, dinner vs drinks) only if needed.
`;

module.exports = { PEARL_KNOWLEDGE };
