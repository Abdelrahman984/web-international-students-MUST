# Quick Start - Strapi CMS Integration

## For Developers: 60-Second Setup

### 1. Configure Backend URL

Create `.env`:
```bash
VITE_API_BASE_URL=http://localhost:1337
```

### 2. Start Strapi

```bash
cd ../strapi-backend  # your Strapi project
npm run develop
# Strapi runs at http://localhost:1337
```

### 3. Start Frontend

```bash
npm run dev
# Frontend runs at http://localhost:5173
```

### 4. Add Content

In Strapi admin panel (`http://localhost:1337/admin`):
- Create 6 single-type content models
- Name them: homepage, academics, questionnaires, resources, announcements, contact-us
- Add title, subtitle, description fields
- Publish each one

### 5. Test

Navigate to each page in frontend:
- http://localhost:5173/announcements
- http://localhost:5173/resources
- http://localhost:5173/questionnaires

Content should load from Strapi!

---

## Adding a New CMS Page

### Step 1: Create Types

Add to `src/types/strapi.ts`:
```tsx
export interface MyNewPage {
  id: number;
  title?: string;
  subtitle?: string;
  // your fields
}
```

### Step 2: Add API Function

Add to `src/services/cmsApi.ts`:
```tsx
export async function getMyNewPage(): Promise<MyNewPage> {
  try {
    const response = await apiRequest<StrapiSingleTypeResponse<MyNewPage>>(
      `/api/my-new-page?populate=*`
    );
    return response.data || {};
  } catch (error) {
    console.error('Error fetching my new page:', error);
    throw error;
  }
}
```

### Step 3: Use in Component

```tsx
import { useCmsData } from '../hooks/useCmsData';
import { getMyNewPage } from '../services/cmsApi';

export function MyNewPage() {
  const { data, loading, error } = useCmsData(getMyNewPage, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{data?.title}</h1>
      {/* render your content */}
    </div>
  );
}
```

Done! ✅

---

## Environment Variables

### Local Development
```bash
VITE_API_BASE_URL=http://localhost:1337
```

### Docker (if Strapi in Docker)
```bash
VITE_API_BASE_URL=http://host.docker.internal:1337
```

### Remote Server
```bash
VITE_API_BASE_URL=http://192.168.1.100:1337
```

### Production
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Debugging

### Check API is Connected

Open DevTools (F12) and look for:
```
[Connected to API: http://localhost:1337]
```

### Verify API Response

In DevTools Network tab:
1. Find request to `/api/announcements?populate=*`
2. Check response has `data` object with your content
3. Confirm HTTP 200 status

### TypeScript Errors?

Make sure CMS fields match `src/types/strapi.ts` interface names exactly (case-sensitive).

---

## What Gets Fetched?

| Page | Endpoint | Fields |
|------|----------|--------|
| Home | `/api/homepage` | title, subtitle, blocks |
| Academics | `/api/academics` | title, subtitle, departments |
| Questionnaires | `/api/questionnaires` | title, subtitle, forms |
| Resources | `/api/resources` | title, subtitle, categories |
| Announcements | `/api/announcements` | title, subtitle, announcements_items |
| Contact | `/api/contact-us` | title, subtitle, email, phone |

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit
```

---

## File Reference

- **`src/types/strapi.ts`** - Data types
- **`src/services/api.ts`** - HTTP client
- **`src/services/cmsApi.ts`** - Page API functions
- **`src/hooks/useCmsData.ts`** - Data fetching hook
- **`.env`** - Configuration
- **`STRAPI_CMS_INTEGRATION.md`** - Full guide

---

## Need Help?

1. Check `STRAPI_CMS_INTEGRATION.md` for full documentation
2. Look at `src/pages/Announcements.tsx` for example implementation
3. Verify Strapi is running: `http://localhost:1337/admin`
4. Check browser console for error messages
5. Verify .env file has correct API URL

---

**Status**: ✅ Ready to Use
**Last Updated**: April 2026
