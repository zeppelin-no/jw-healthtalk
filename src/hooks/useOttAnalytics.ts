import { useCallback, useEffect, useRef, useState } from 'react';

import type { PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';

const useOttAnalytics = (item?: PlaylistItem, feedId: string = '') => {
  const analyticsToken = useConfigStore((s) => s.config.analyticsToken);
  const [player, setPlayer] = useState<jwplayer.JWPlayer | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const timeHandler = useCallback(
    ({ position, duration }: jwplayer.TimeParam) => {
      if (!isSeeking) {
        window.jwpltx.time(position, duration);
      }
    },
    [isSeeking],
  );

  const seekHandler = useCallback(() => {
    clearTimeout(timer.current);
    setIsSeeking(true);
  }, [setIsSeeking]);

  const seekedHandler = useCallback(() => {
    // There is currently a 1 sec debounce surrounding this event in order to logically group multiple `seeked` events
    timer.current = window.setTimeout(() => {
      setIsSeeking(false);
      window.jwpltx.seeked();
    }, 1000);
  }, [setIsSeeking, timer]);

  const playlistItemHandler = useCallback(() => {
    if (!analyticsToken) return;

    if (!item) {
      return;
    }

    window.jwpltx.ready(analyticsToken, window.location.hostname, feedId, item.mediaid, item.title);
  }, [item]);

  const completeHandler = useCallback(() => {
    window.jwpltx.complete();
  }, []);

  const adImpressionHandler = useCallback(() => {
    window.jwpltx.adImpression();
  }, []);

  useEffect(() => {
    if (!window.jwpltx || !analyticsToken || !player || !item) {
      return;
    }

    player.on('playlistItem', playlistItemHandler);
    player.on('complete', completeHandler);
    player.on('time', timeHandler);
    player.on('seek', seekHandler);
    player.on('seeked', seekedHandler);
    player.on('adImpression', adImpressionHandler);

    return () => {
      player.off('playlistItem', playlistItemHandler);
      player.off('complete', completeHandler);
      player.off('time', timeHandler);
      player.off('seek', seekHandler);
      player.off('seeked', seekedHandler);
      player.off('adImpression', adImpressionHandler);
    };
  }, [player, timeHandler, seekHandler, seekedHandler, playlistItemHandler, completeHandler, adImpressionHandler]);

  return setPlayer;
};

export default useOttAnalytics;
