## Meet the Team page

**Route:** `/meet-the-team`

### Updating team members

All content for this page is data-driven and lives in one place:

- `supervisors` array in `src/pages/MeetTheTeam.tsx`
- `developers` array in `src/pages/MeetTheTeam.tsx`

To update a member:

- **Edit a name/title/subtitle/role:** update the relevant object field.
- **Edit an email:** update `email` (the card and `mailto:` link update automatically).
- **Edit LinkedIn:** update `linkedInUrl`.
- **Add a new member:** add another object to the array, keeping fields consistent.
- **Reorder members:** reorder objects in the arrays.

### Headshots

The page currently uses an accessible SVG headshot placeholder component. To replace placeholders with real photos later:

- Add images to `public/` (or use a CMS-managed URL).
- Replace the `HeadshotPlaceholder` in `MeetTheTeam.tsx` with an `<img>` element:
  - Always include descriptive `alt` text.
  - Keep dimensions consistent (recommended: 96×96 or larger).

### SEO

Per-page SEO tags are managed via the `Seo` component (`src/components/Seo.tsx`) using `react-helmet-async`.

To adjust the page SEO:

- Edit the `Seo` props inside `MeetTheTeam.tsx` (`title`, `description`, `keywords`).

