import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import styles from './Series.module.scss';

import useEntitlement from '#src/hooks/useEntitlement';
import CardGrid from '#src/components/CardGrid/CardGrid';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { episodeURL, formatVideoMetaString } from '#src/utils/formatting';
import Filter from '#src/components/Filter/Filter';
import VideoDetails from '#src/components/VideoDetails/VideoDetails';
import useMedia from '#src/hooks/useMedia';
import { useSeriesData } from '#src/hooks/useSeriesData';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import { generateEpisodeJSONLD } from '#src/utils/structuredData';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import StartWatchingButton from '#src/containers/StartWatchingButton/StartWatchingButton';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Cinema from '#src/containers/Cinema/Cinema';
import TrailerModal from '#src/containers/TrailerModal/TrailerModal';
import ShareButton from '#src/components/ShareButton/ShareButton';
import FavoriteButton from '#src/containers/FavoriteButton/FavoriteButton';
import Button from '#src/components/Button/Button';
import PlayTrailer from '#src/icons/PlayTrailer';
import type { PlaylistItem } from '#types/playlist';
import CardTag from '#src/components/Tag/CardTag';
import { getEpisodes } from '#src/utils/series';

type SeriesRouteParams = {
  id: string;
};

const Series = ({ match, location }: RouteComponentProps<SeriesRouteParams>): JSX.Element => {
  const breakpoint = useBreakpoint();
  const { t } = useTranslation('video');
  const [playTrailer, setPlayTrailer] = useState<boolean>(false);

  // Routing
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const seriesId = match?.params.id;
  const episodeId = searchParams.get('e') || '';
  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('l');

  // Config
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { styling, features, siteName } = config;
  const posterFading: boolean = styling?.posterFading === true;
  const enableSharing: boolean = features?.enableSharing === true;
  const isFavoritesEnabled: boolean = Boolean(features?.favoritesList);

  // Media
  const { isLoading: isPlaylistLoading, isError: isSeriesError, series } = useSeriesData(seriesId);

  const { currentEpisode, nextEpisode } = getEpisodes(episodeId, series);

  const [seasonFilter, setSeasonFilter] = useState<string>(currentEpisode?.seasonNumber || series?.seasons?.[0]?.season_number?.toString() || '');
  const filters = useMemo(() => series?.seasons?.map((season) => season.season_number.toString()), [series]);

  const filteredEpisodes = useMemo(
    () => series?.seasons?.filter((season) => !seasonFilter || Number(seasonFilter) === season.season_number).flatMap((season) => season.episodes),
    [series, seasonFilter],
  );

  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = 640 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const poster = currentEpisode?.image.replace('720', imageSourceWidth.toString()); // Todo: should be taken from images (1280 should be sent from API)

  // Watch history
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  // User, entitlement
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  useBlurImageUpdater(currentEpisode);

  // Handlers
  const goBack = () => currentEpisode && series && history.push(episodeURL(series, currentEpisode, false));
  const onCardClick = (item: PlaylistItem) => series && history.replace(episodeURL(series, item));

  const handleComplete = useCallback(() => {
    if (nextEpisode?.mediaid && series) {
      history.push(episodeURL(series, nextEpisode, true));
    }
  }, [history, nextEpisode, series]);

  // Effects
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0, behavior: 'smooth' });
  }, [episodeId]);

  useEffect(() => {
    if (!searchParams.has('e') && series && nextEpisode?.mediaid) {
      history.replace(episodeURL(series, nextEpisode));
    }
  }, [history, searchParams, nextEpisode, series]);

  useEffect(() => {
    setSeasonFilter(currentEpisode?.seasonNumber || '1');
  }, [currentEpisode, setSeasonFilter]);

  // The raw item is used for actually playing the media, because it's signed / content protected
  const { data: rawItem, isLoading: isEpisodeLoading, isError: isItemError } = useMedia(episodeId);
  const { data: trailerItem, isLoading: isTrailerLoading } = useMedia(rawItem?.trailerId || '');
  const { isEntitled } = useEntitlement(rawItem);

  const isLoading = isPlaylistLoading || isEpisodeLoading;

  // UI
  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isSeriesError || !series) {
    return <ErrorPage title={t('series_error')} />;
  }

  if (isItemError || !currentEpisode || !rawItem) {
    return <ErrorPage title={t('episode_not_found')} />;
  }

  const pageTitle = `${currentEpisode.title} - ${siteName}`;
  const canonicalUrl = series && currentEpisode ? `${window.location.origin}${episodeURL(series, currentEpisode)}` : window.location.href;

  const primaryMetadata = formatVideoMetaString(currentEpisode, t('video:total_episodes', { count: series.episode_count }));
  const secondaryMetadata = (
    <>
      <strong>
        <CardTag item={currentEpisode} includeTag={false} />
      </strong>{' '}
      - {currentEpisode.title}
    </>
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={currentEpisode.description} />
        <meta property="og:description" content={currentEpisode.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:type" content="video.episode" />
        {currentEpisode.image && <meta property="og:image" content={currentEpisode.image?.replace(/^https:/, 'http:')} />}
        {currentEpisode.image && <meta property="og:image:secure_url" content={currentEpisode.image?.replace(/^http:/, 'https:')} />}
        <meta property="og:image:width" content={currentEpisode.image ? '720' : ''} />
        <meta property="og:image:height" content={currentEpisode.image ? '406' : ''} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={currentEpisode.description} />
        <meta name="twitter:image" content={currentEpisode.image} />
        <meta property="og:video" content={canonicalUrl.replace(/^https:/, 'http:')} />
        <meta property="og:video:secure_url" content={canonicalUrl.replace(/^http:/, 'https:')} />
        <meta property="og:video:type" content="text/html" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        {currentEpisode.tags?.split(',').map((tag) => (
          <meta property="og:video:tag" content={tag} key={tag} />
        ))}
        <script type="application/ld+json">{generateEpisodeJSONLD(series, currentEpisode)}</script>
      </Helmet>
      <Cinema
        open={play && isEntitled}
        onClose={goBack}
        item={rawItem}
        title={currentEpisode.title}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={
          <>
            <strong>{secondaryMetadata}</strong> - {currentEpisode.title}
          </>
        }
        onComplete={handleComplete}
        feedId={feedId ?? undefined}
      />
      <TrailerModal item={trailerItem} title={`${currentEpisode.title} - Trailer`} open={playTrailer} onClose={() => setPlayTrailer(false)} />
      <VideoDetails
        title={currentEpisode.title}
        description={currentEpisode.description}
        primaryMetadata={primaryMetadata}
        secondaryMetadata={secondaryMetadata}
        poster={poster}
        posterMode={posterFading ? 'fading' : 'normal'}
        shareButton={enableSharing ? <ShareButton title={currentEpisode.title} description={currentEpisode.description} url={canonicalUrl} /> : null}
        startWatchingButton={<StartWatchingButton item={currentEpisode} playUrl={episodeURL(series, currentEpisode, true)} />}
        favoriteButton={isFavoritesEnabled && <FavoriteButton item={currentEpisode} />}
        trailerButton={
          (!!trailerItem || isTrailerLoading) && (
            <Button
              label={t('video:trailer')}
              aria-label={t('video:watch_trailer')}
              startIcon={<PlayTrailer />}
              onClick={() => setPlayTrailer(true)}
              active={playTrailer}
              fullWidth={breakpoint < Breakpoint.md}
              disabled={!trailerItem}
            />
          )
        }
      >
        <>
          <div className={styles.episodes}>
            <h3>{t('episodes')}</h3>
            {filters && filters.length > 1 && (
              <Filter
                name="categories"
                value={seasonFilter}
                formatValue={(value: string) => (value === '0' ? t('season_number_0') : t('season_number_select', { value }))}
                defaultLabel={t('all_seasons')}
                options={filters}
                setValue={setSeasonFilter}
              />
            )}
          </div>
          <CardGrid
            playlist={filteredEpisodes || []}
            onCardClick={onCardClick}
            watchHistory={watchHistoryDictionary}
            isLoading={isLoading}
            currentCardItem={currentEpisode}
            currentCardLabel={t('current_episode')}
            enableCardTitles={styling.shelfTitles}
            accessModel={accessModel}
            isLoggedIn={!!user}
            hasSubscription={!!subscription}
          />
        </>
      </VideoDetails>
    </React.Fragment>
  );
};

export default Series;
