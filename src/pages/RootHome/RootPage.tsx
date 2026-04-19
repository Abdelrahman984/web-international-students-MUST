import { CmsSingleTypePage } from '../../components/CmsSingleTypePage';
import { getPageBySlug } from '../../services/cmsApi';

export function RootPage() {
    return (
        <CmsSingleTypePage
            fetcher={() => getPageBySlug('home')}
            fallbackTitle="Home"
            fallbackSubtitle="Welcome"
        />
    );
}