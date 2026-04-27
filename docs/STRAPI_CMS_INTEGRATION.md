# Strapi CMS Integration Guide

This frontend has been integrated with Strapi v5 CMS for dynamic content management. This document explains how to configure and use the integration.

## The Solution

This frontend now fetches content from Strapi single-type endpoints instead of using hardcoded data. Key features include:

- **Global API Configuration**: Single configurable base URL via `.env`
- **TypeScript Types**: Full type safety for all CMS responses
- **Error Handling**: Loading and error states on all pages
- **Fallback Data**: Graceful degradation with mock data when CMS is unavailable
- **Reusable API Layer**: Centralized fetch functions, no hardcoded URLs in components

## Environment Setup

### Configuration

Create a `.env` file in the project root (or update if exists):

```bash
# Local development
VITE_API_BASE_URL=http://localhost:1337

# Or point to production
# VITE_API_BASE_URL=https://your-strapi-instance.com
```

Example `.env` configurations:

```bash
# Local docker/machine
VITE_API_BASE_URL=http://localhost:1337

# Remote dev server
VITE_API_BASE_URL=http://192.168.1.100:1337

# Production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Verifying Configuration

To check your current API base URL in development, the frontend logs it on startup. Look in browser console:

```
[CMS] Connecting to: http://localhost:1337
```

## Strapi Backend Requirements

Your Strapi v5 instance must have the following single-type endpoints configured:

| Endpoint | Current Page |
|----------|--------------|
| `/api/homepage?populate=*` | Home page (`/`) |
| `/api/academics?populate=*` | Academics (`/academics`) |
| `/api/questionnaires?populate=*` | Questionnaires (`/questionnaires`) |
| `/api/resources?populate=*` | Resources (`/resources`) |
| `/api/announcements?populate=*` | Announcements (`/announcements`) |
| `/api/contact-us?populate=*` | Contact Us (`/contact-us`) |

### Strapi Schema Examples

Each single-type should have fields like:

```
- title: String
- subtitle: String
- description: Text
- blocks: JSON (rich text, quotes, media, sliders)
- [page-specific fields]
```

For announcements specifically:
```
- titulo: String
- subtitle: String
- announcements_items: Array [
    - title
    - excerpt
    - content
    - date
    - category
    - urgent (Boolean)
  ]
```

## Architecture

### File Structure

```
src/
├── types/
│   └── strapi.ts              # TypeScript interfaces for all CMS responses
├── services/
│   ├── api.ts                 # Low-level HTTP client with env config
│   └── cmsApi.ts              # Page-specific fetch functions
├── hooks/
│   └── useCmsData.ts          # React hook for data fetching with loading/error states
├── components/
│   └── ContentBlocks.tsx       # Rendering dynamic content blocks from CMS
└── pages/
    ├── Announcements.tsx      # Updated with CMS integration
    ├── Resources.tsx          # Updated with CMS integration
    ├── Questionnaires.tsx     # Updated with CMS integration
    └── ...
```

### Data Flow

```
1. Page Component
   ↓ (calls)
2. useCmsData Hook (manages loading/error state)
   ↓ (calls)
3. cmsApi.getPageName()
   ↓ (calls)
4. apiRequest() with configurable base URL
   ↓ (fetches from)
5. VITE_API_BASE_URL + /api/endpoint
```

## Usage Examples

### In a React Component

```tsx
import { useCmsData } from '../hooks/useCmsData';
import { getAnnouncements } from '../services/cmsApi';

function MyPage() {
  const { data, loading, error } = useCmsData(getAnnouncements, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{data?.title}</h1>
      <p>{data?.subtitle}</p>
    </div>
  );
}
```

### Adding a New CMS Page

1. **Define Types** in `src/types/strapi.ts`:
```tsx
export interface MyPage {
  id: number;
  title?: string;
  // ... other fields
}
```

2. **Add API Function** in `src/services/cmsApi.ts`:
```tsx
export async function getMyPage(): Promise<MyPage> {
  try {
    const response = await apiRequest<StrapiSingleTypeResponse<MyPage>>(
      `/api/my-page?populate=*`
    );
    return response.data || {};
  } catch (error) {
    console.error('Error fetching my page:', error);
    throw error;
  }
}
```

3. **Use in Component**:
```tsx
const { data, loading, error } = useCmsData(getMyPage, []);
```

## Error Handling

The frontend implements graceful error handling:

- **Network Errors**: Displayed to user, fallback to mock data
- **Loading States**: Spinner shown during fetch
- **Missing Fields**: Fallback to default/empty values
- **Type Safety**: TypeScript ensures data shape correctness

### Example Error UI

```tsx
{error && !loading && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <AlertCircle className="text-red-600" />
    <h3>Failed to load content</h3>
    <p>{error.message || 'Using fallback data.'}</p>
  </div>
)}
```

## Development Workflow

### Start Local Strapi

```bash
# In your Strapi project directory
cd strapi-backend
npm run develop
# Strapi will be available at http://localhost:1337
```

### Start Frontend Dev Server

```bash
# In this frontend project
npm run dev
# Frontend will be available at http://localhost:5173
```

### Verify Integration

1. Make sure `.env` has `VITE_API_BASE_URL=http://localhost:1337`
2. Open browser DevTools (F12)
3. Look for API logs in console showing successful fetches
4. Navigate to each page and verify content loads

### Debug Tips

- Check browser Network tab to see API requests
- Verify Strapi `/api/homepage?populate=*` responds with data
- Ensure CORS is enabled on Strapi backend
- Check browser console for errors
- Look at Strapi admin panel to confirm content exists

## Building for Production

### 1. Set Production Environment

Create `.env.production` or set env vars on deployment:

```bash
VITE_API_BASE_URL=https://your-strapi-instance.com
```

### 2.  Build

```bash
npm run build
```

###3. Test Build

```bash
npm run preview
```

## API Response Contract

All endpoints return:

```tsx
{
  data: {
    id: number;
    title?: string;
    subtitle?: string;
    description?: string;
    blocks?: ContentBlock[];
    // ... page-specific fields
  };
  meta?: {
    pagination?: { /* ... */ };
  };
}
```

## Content Blocks

The frontend supports dynamic content blocks:

- **Rich Text**: HTML content with XSS protection
- **Quote**: Quote with optional author attribution
- **Media**: Images with captions
- **Slider**: Image galleries

See `src/components/ContentBlocks.tsx` for rendering logic.

## Troubleshooting

### "Failed to load content" Error

1. Check if Strapi is running: `http://localhost:1337/admin`
2. Verify endpoint exists: `http://localhost:1337/api/homepage?populate=*`
3. Check `.env` file has correct `VITE_API_BASE_URL`
4. Check browser console for CORS errors
5. Ensure Strapi has CORS configured for your frontend URL

###No Data Shows

1. Verify content exists in Strapi admin panel
2. Ensure `populate=*` query parameter is being sent
3. Check that Strapi fields match TypeScript interface names
4. Verify API is returning data (check Network tab in DevTools)

### TypeScript Errors

Ensure your CMS response matches the TypeScript interface defined in `src/types/strapi.ts`. Update types if your Strapi schema differs.

## Performance Optimization

- Responses are cached by browser until page refresh
- Consider adding React Query/SWR for automated caching and revalidation
- Set appropriate cache headers on Strapi backend

## Security Considerations

- `VITE_API_BASE_URL` is exposed in frontend build (it's public-safe)
- API responses are sanitized to prevent XSS
- Never put sensitive data URL tokens in frontend code
- Use Strapi's built-in role/permission system for access control

## Next Steps

1. Create Strapi single-types with content
2. Set `.env` to correct Strapi instance
3. Update TypeScript interfaces if schema differs
4. Test each page to verify content loads
5. Deploy!

## Support

For issues or questions:
- Check browser DevTools Network tab
- Review Strapi API response format
- Verify TypeScript types match CMS schema
- Check .env variables are set correctly
