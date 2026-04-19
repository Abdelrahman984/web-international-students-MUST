import { useParams } from 'react-router-dom';
import { CmsSingleTypePage } from '../components/CmsSingleTypePage';
import { getPageBySlug } from '../services/cmsApi';

export function CmsPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <CmsSingleTypePage
      fetcher={() => getPageBySlug(slug)}
      fallbackTitle={slug}
    />
  );
}