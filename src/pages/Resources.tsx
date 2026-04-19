import { CmsSingleTypePage } from '../components/CmsSingleTypePage';
import { getResources } from '../services/cmsApi';
export function Resources() {
  return (
    <CmsSingleTypePage
      fetcher={getResources}
      fallbackTitle="Resources"
      fallbackSubtitle="Helpful documents and links"
    />
  );
}

