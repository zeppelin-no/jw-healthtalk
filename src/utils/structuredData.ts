import { episodeURL, movieURL } from './formatting';
import { secondsToISO8601 } from './datetime';

import type { PlaylistItem } from '#types/playlist';
import type { Series } from '#types/series';

export const generateSeriesMetadata = (series: Series) => {
  const seriesCanonical = `${window.location.origin}${episodeURL(series)}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: series.title,
    numberOfEpisodes: series.episode_count,
    numberOfSeasons: series.seasons?.length || 1,
  };
};

export const generateEpisodeJSONLD = (series: Series, episode: PlaylistItem) => {
  const episodeCanonical = `${window.location.origin}${episodeURL(series, episode)}`;
  const seriesMetadata = generateSeriesMetadata(series);

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episode.episodeNumber,
    seasonNumber: episode.seasonNumber,
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};

export const generateMovieJSONLD = (item: PlaylistItem) => {
  const movieCanonical = `${window.location.origin}${movieURL(item)}`;

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'VideoObject',
    '@id': movieCanonical,
    name: item.title,
    description: item.description,
    duration: secondsToISO8601(item.duration, true),
    thumbnailUrl: item.image,
    uploadDate: secondsToISO8601(item.pubdate),
  });
};
