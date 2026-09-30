# Pricing planner review — September 30, 2026

## Purpose
Help prospective clients understand Joëlle's services and start a conversation. These pages are planning aids, not binding quotations or checkout flows.

## Calibration
Joëlle described a card-deck illustration commission: a basic line drawing begins around $100, rising to about $800 with detail, color and requirements, without royalties. A royalty arrangement can change the upfront fee through negotiation. This is the source of the illustration range; it is per distinct image, not a whole deck. The calculator does not invent royalty percentages, discounts, buyout terms or volume pricing.

Other displayed bands preserve or lightly round the existing studio entry scopes after removing stacking: loose personal work $300–500; developed personal work $950–1,400; a defined design piece $650–950; focused logo $850–1,100; starter identity $1,900–2,600; small campaign $1,350–2,050; mural first look $350–500; complete mural design $2,400–3,500; mural artwork with handoff $3,200–4,800. These still need calibration against Joëlle's completed projects and time/cost records. They are not claimed to be market averages or Handbook rates.

Larger scenes, institutional work, packaging, extensive identities and multiple-wall/public-art projects now request a conversation rather than displaying an uncalibrated very large number. No broader promise of a lower final fee is made.

## Research (primary sources, accessed September 30, 2026)
- [MIT Press: published excerpt from Graphic Artists Guild Handbook, 16th edition (2021)](https://mitpress.mit.edu/how-should-one-price-a-commissioned-project/). Pricing depends on project scope and use, budget, timing and the artist. Separately identify materials, usage and contracted services; consider a narrower scope when budget and proposed work do not match. The public page quotes only seven words, “no two jobs are exactly alike.” We did not consult the book's full rate tables.
- [Graphic Artists Guild: current 17th edition](https://graphicartistsguild.org/the-graphic-artists-guild-handbook-pricing-ethical-guidelines/). Linked as further reading, not as the source of our dollar figures or an endorsement.
- [Brimming Design, Toledo: branding](https://brimmingdesign.com/branding/). A $1,000 logo package includes specified concepts/revisions and final file formats. Helpful comparison for clearly specifying deliverables, not an exact comparison with Joëlle's process.
- [Maxi Haus Studios: mural pricing](https://www.maxihausstudios.com/pricing). Lists $1,000–1,500 concept design fees and separate mural execution. Supports separating design from on-site painting; not equivalent to a complete standalone mural design and handoff package.
- [Cindy McDonough: pet portraits](https://www.cindymcdonoughart.com/pricing). Narrow one-pet watercolor scopes range $125–225 by size/finish, with distinct added-pet fees. Shows why a small defined commission should not inherit institutional artwork pricing. These are another artist's offers, not a recommended fee for Joëlle.
- [Joëlle's commissions](https://monochromecanvas.com/pages/commissions) and [about page](https://monochromecanvas.com/pages/about). Ground service descriptions in existing work, education and design-only mural role. Biography alone cannot determine a sustainable fee.

## Problems removed
The previous artwork formula multiplied category, subject, detail, finish, size, quantity and rush, sometimes describing the same work more than once. Usage, production and reference allowances could also receive rush multipliers. Graphic identities could pay again for their defining scope; mural first looks could inherit execution-planning fees. More controls did not make those estimates more credible.

The replacement uses explicit scope bands. Use, deadline and budget are inquiry context, not hidden markups. Collections stay clearly per-image, with the series quoted together. Royalties replace the numeric headline with a negotiation invitation and retain the no-royalty reference in plain language. No automatic deposit or delivery commitment is shown. Included handoff work is named once. Painting and installation remain excluded from mural design.

## Navigation and implementation
Client-tool dropdowns contain only the four print/client tools. The three creative pages have a Work with Joëlle dropdown containing only Artwork Commissions, Graphic Design and Mural Design. They explicitly describe hiring Joëlle directly and invite visitors to review her portfolio for a stylistic fit before requesting a quote. All three use pricing-planner.js and pricing-planner.css, with tiny per-page entry scripts. Editable bands live in `projects`; matching static starting cards are validated by browser tests. Optional notes remain local until the visitor opens their email or copies them; this change adds no submissions, analytics or booking promises.

## Validation
Pure pricing checks cover every category across use choices, deadlines/budgets that must not inflate prices, per-image collections, royalty negotiation, unknown categories and invalid quantities. Browser checks cover navigation, 320/390px layouts, card selection, inquiry/email consistency, royalty and project switching, plus existing print-tool upload flows. All tests avoid sending inquiries.
