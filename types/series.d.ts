// These types match the API data

import { PlaylistItem } from '#types/playlist';

export type GetSeriesParams = {
  season?: number;
};

type Episode = {
  media_id: string;
  episode_number: number;
};

type SeasonData<TEpisode = Episode> = {
  season_id: string;
  season_number: number;
  season_title: string;
  season_description: string;
  episode_count: number;
  total_duration: number;
  episodes: TEpisode[];
};

export type SeriesData<TEpisode = Episode> = {
  title: string;
  description: string;
  series_id: string;
  total_duration: number;
  episode_count: number;
  episodes?: TEpisode[];
  seasons?: SeasonData<TEpisode>[];
};

// These types match the business logic
// Use PlaylistItem as episode type so we have all the metadata in 1 structure
export type Season = SeasonData<PlaylistItem>;

// This is Series data without the extra episodes property,
// because uncategorized episodes will be added as Season 0
export type Series = Omit<SeriesData<PlaylistItem>, 'episodes'>;
