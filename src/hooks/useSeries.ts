import { useQuery } from 'react-query';

import { getSeries } from '#src/services/api.service';
import type { SeriesData } from '#types/series';
import type { ApiError } from '#src/utils/api';

// 8 hours
export const SeriesStaleTime = 8 * 60 * 60 * 1000;

export default (seriesId: string) => {
  return useQuery<SeriesData | undefined, ApiError>(`series-${seriesId}`, async () => await getSeries(seriesId), {
    staleTime: SeriesStaleTime,
    retry: 2,
    retryDelay: 200,
  });
};
