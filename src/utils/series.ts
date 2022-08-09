import type { Series, Episode, SeasonData, SeriesData } from '#types/series';
import type { Playlist, PlaylistItem } from '#types/playlist';

export const getEpisodes = (episodeId?: string, series?: Series) => {
  const orderedEpisodes = series?.seasons?.flatMap((season) => season.episodes) || [];

  const currentIndex = orderedEpisodes?.findIndex((episode) => episodeId && episode.mediaid === episodeId);

  return {
    currentEpisode: orderedEpisodes[currentIndex],
    nextEpisode: orderedEpisodes[currentIndex + 1],
  };
};

export const sortSeries = (series: SeriesData<PlaylistItem>): Series => {
  series.seasons ||= [];

  // Add the unassigned episodes as a 'season' at the beginning of the data, so downstream code doesn't have to check episodes or seasons
  series.seasons.unshift({
    season_id: '',
    season_title: '',
    season_description: '',
    season_number: 0,
    episode_count: series.episodes?.length || 0,
    total_duration: series.episodes?.reduce((total, episode) => total + (episode.duration || 0), 0) || 0,
    episodes: series.episodes || [],
  });

  // Remove any empty seasons
  series.seasons = series.seasons.filter((season) => !!season.episodes?.length);

  series.seasons.forEach((season) => season.episodes.sort((a, b) => (Number(a.episodeNumber) || 0) - (Number(b.episodeNumber) || 0)));
  series.seasons.sort((a, b) => a.season_number - b.season_number);

  return series;
};

export const mapEpisodes = (episodes: Episode[] | undefined, mediaItems: { [key: string]: PlaylistItem }, season?: SeasonData): PlaylistItem[] => {
  return (
    episodes?.map((episode) => ({
      ...mediaItems[episode.media_id],
      seasonNumber: (season?.season_number || 0).toString(),
      episodeNumber: (episode.episode_number || 0).toString(),
    })) || []
  );
};

export const playlistToSeries = (playlist?: Playlist): Series | undefined => {
  if (!playlist) {
    return undefined;
  }

  const episodes: PlaylistItem[] = [];
  const seasons: { [key: string]: SeasonData<PlaylistItem> } = {};

  playlist.playlist.forEach((item) => {
    // @ts-ignore
    const seasonNumber = Number(item.seasonNumber) || 0;

    const episode: PlaylistItem = {
      ...item,
      seasonNumber: seasonNumber.toString(),
      episodeNumber: (Number(item.episodeNumber) || 0).toString(),
    };

    if (seasonNumber) {
      if (!seasons[seasonNumber]) {
        seasons[seasonNumber] = {
          season_id: '',
          season_number: seasonNumber,
          season_title: '',
          season_description: '',
          episode_count: 0,
          total_duration: 0,
          episodes: [],
        };
      }

      seasons[seasonNumber].episode_count++;
      seasons[seasonNumber].total_duration += item.duration;
      seasons[seasonNumber].episodes.push(episode);
    } else {
      episodes.push(episode);
    }
  });

  return sortSeries({
    series_id: playlist.feedid || '',
    title: playlist.title,
    description: playlist.description || '',
    episode_count: playlist.playlist.length,
    total_duration: playlist.playlist.reduce((duration, item) => duration + (item.duration || 0), 0),
    seasons: Object.values(seasons),
    episodes: episodes,
  });
};
