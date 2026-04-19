# Navigation Expansion Notes

Use this file to extend the LinksBar structure safely.

## Current Implemented Nodes

Top-level:

- Home -> `/`
- Academics -> `/academics`
- Activities -> `/activities`
- Facilities -> `/facilities`
- News -> `/news`
- Events -> `/events`
- Contact Us -> `/contact-us`

Academics dropdown:

- Academic Staff -> `/academics`
- Undergraduate Programs -> `/undergraduate`
- Postgraduate programs -> `/postgraduate`
- Academic Advising -> `/academic-advising`
- Registeration -> `/Registeration`
- Schedules -> `/schedules`
- Calendar -> `/calendar`
- E-learning -> `/e-learning`
- How To Apply -> `/how-to-apply`

Activities dropdown:

- Cultural -> `/cultural`
- Sports -> `/sports`
- Art -> `/art`
- Student Clubs -> `/student-clubs`

## Supabase Connectivity Notes

- Known routes with dedicated React pages:
  - `/academics`
  - `/undergraduate`
  - `/postgraduate`
  - `/schedules`
  - `/news`
  - `/events`
  - `/contact-us`

- Remaining links are expected to resolve through CMS slug pages via Supabase `pages` table.
- If any route does not resolve, add an entry to the `pages` table with matching slug, or add an explicit route component in `src/App.tsx`.
- Hero slider navigation reads from Supabase only when `VITE_SUPABASE_HERO_MENU_TABLE` is set and the table contains `slug='hero-nav'` with an `items` JSON column.
- If that table is missing or empty, the app falls back to the static navigation tree.

## Additions Template

For each new item you want added:

- Label:
- URL path:
- Parent menu: (top-level / Academics / Activities / other)
- Backed by: (React page / Supabase pages slug)
- Priority:
