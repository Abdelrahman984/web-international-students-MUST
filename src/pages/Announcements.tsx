import { CmsSingleTypePage } from '../components/CmsSingleTypePage';
import { getAnnouncements } from '../services/cmsApi';

export function Announcements() {
  return (
    <CmsSingleTypePage
      fetcher={getAnnouncements}
      fallbackTitle="Announcements"
      fallbackSubtitle="Latest updates and notices"
    />
  );
}
