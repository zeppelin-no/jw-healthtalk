import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PlaylistItem } from '#types/playlist';
import Tag from '#src/components/Tag/Tag';
import DurationTag from '#src/components/Tag/DurationTag';

function CardTag({ item, includeTag = true }: { item: PlaylistItem; includeTag?: boolean }): JSX.Element | null {
  const { t } = useTranslation('common');

  const liveText = t('live');

  const getTagText = () => {
    if (item.seriesId) {
      return t('tag_series');
    }

    if (item.seasonNumber && item.seasonNumber !== '0' && item.episodeNumber) {
      return t('tag_season_episode', { seasonNumber: item.seasonNumber, episodeNumber: item.episodeNumber });
    }

    if (item.episodeNumber && item.episodeNumber !== '0') {
      return t('tag_episode', { episodeNumber: item.episodeNumber });
    }

    if (item.duration) {
      return <DurationTag seconds={item.duration} />;
    }

    if (item.duration === 0) {
      return liveText;
    }

    return null;
  };

  const tagText = getTagText();

  if (!tagText) {
    return null;
  }

  if (includeTag) {
    return <Tag isLive={tagText === liveText}>{tagText}</Tag>;
  }

  return <>{tagText}</>;
}

export default CardTag;
