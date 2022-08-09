import { useMemo } from 'react';
import { useQuery } from 'react-query';

import usePlaylist from '#src/hooks/usePlaylist';
import useSeries, { SeriesStaleTime } from '#src/hooks/useSeries';
import { getMediaByIds } from '#src/services/api.service';
import type { Season, Series } from '#types/series';
import { mapEpisodes, playlistToSeries, sortSeries } from '#src/utils/series';

export const useSeriesData = (
  seriesId: string,
): {
  series?: Series;
  isError: boolean;
  isLoading: boolean;
} => {
  const { data: series, isLoading: isSeriesLoading, error: seriesError, isError: isSeriesError } = useSeries(seriesId);

  // If the new series api call fails with a 404 not found, fallback to try to get the series as a playlist
  const usePlaylistFallback = isSeriesError && seriesError?.code === 404;
  const { data: playlistData, isLoading: isPlaylistLoading, isError: isPlaylistError } = usePlaylist(seriesId, {}, usePlaylistFallback, false);

  const playlistAsSeries = useMemo(() => playlistToSeries(playlistData), [playlistData]);

  // If we used the series API, we need to retrieve the episode media items as well
  const {
    data: seriesWithEpisodes,
    isLoading: isEpisodesLoading,
    isError: isEpisodesError,
  } = useQuery(
    `series-episodes-${seriesId}`,
    async () => {
      if (!series) {
        return undefined;
      }

      // Get all media id's and remove duplicates
      const mediaIds = (series.seasons?.flatMap((season) => season.episodes) || [])
        .concat(series.episodes || [])
        .map((episode) => episode.media_id)
        .filter((item, index, arr) => item && arr.indexOf(item) === index);

      // TODO: Find a way to fix this for DRM / signing properties or replace with new series watchlist endpoint
      const mediaItems = Object.fromEntries((await getMediaByIds(mediaIds)).map((item) => [item.mediaid, item]));

      const seasons: Season[] =
        series.seasons?.map((season) => ({
          ...season,
          episodes: mapEpisodes(season.episodes, mediaItems, season),
        })) || [];

      const episodes = mapEpisodes(series?.episodes, mediaItems);

      return sortSeries({
        ...series,
        seasons: seasons,
        episodes: episodes,
      });
    },
    {
      enabled: !!series && !isSeriesLoading && !isSeriesError,
      staleTime: SeriesStaleTime,
      retry: 2,
      retryDelay: 200,
    },
  );

  return {
    series: seriesWithEpisodes || playlistAsSeries,
    isError: (isSeriesError && isPlaylistError) || isEpisodesError,
    isLoading: isSeriesLoading || isPlaylistLoading || isEpisodesLoading,
  };
};
