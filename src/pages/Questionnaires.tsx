import { CmsSingleTypePage } from '../components/CmsSingleTypePage';
import { getQuestionnaires } from '../services/cmsApi';

const Questionnaires = () => {
  return (
    <CmsSingleTypePage
      fetcher={getQuestionnaires}
      fallbackTitle="Questionnaires"
      fallbackSubtitle="Forms and surveys for students"
    />
  );
};

export default Questionnaires;

