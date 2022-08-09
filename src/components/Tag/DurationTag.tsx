import React from 'react';
import { useTranslation } from 'react-i18next';

import { logDev } from '#src/utils/common';

function DurationTag({ seconds }: { seconds: number }): JSX.Element | null {
  const { t } = useTranslation('common');
  logDev(t);
  if (!seconds) {
    return null;
  }

  const minutes = Math.ceil(seconds / 60);

  return <>{t('tag_duration_minutes', { minutes })}</>;
}

export default DurationTag;
