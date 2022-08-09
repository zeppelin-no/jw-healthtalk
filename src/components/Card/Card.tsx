import React, { KeyboardEvent, memo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Lock from '../../icons/Lock';

import styles from './Card.module.scss';

type CardProps = {
  onClick?: () => void;
  onHover?: () => void;
  title: string;
  posterSource?: string;
  tag: JSX.Element;
  progress?: number;
  posterAspect?: '1:1' | '2:1' | '2:3' | '4:3' | '5:3' | '16:9' | '9:16';
  featured?: boolean;
  disabled?: boolean;
  loading?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  currentLabel?: string;
  enableTitle?: boolean;
};

function Card({
  onClick,
  onHover,
  title,
  posterSource,
  tag,
  progress,
  posterAspect = '16:9',
  enableTitle = true,
  featured = false,
  disabled = false,
  loading = false,
  isCurrent = false,
  isLocked = true,
  currentLabel,
}: CardProps): JSX.Element {
  const { t } = useTranslation('common');
  const cardClassName = classNames(styles.card, {
    [styles.featured]: featured,
    [styles.disabled]: disabled,
  });
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`], {
    [styles.current]: isCurrent,
  });

  return (
    <div
      className={cardClassName}
      onClick={onClick}
      onMouseEnter={onHover}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event: KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && !disabled && onClick && onClick()}
      role="button"
      aria-label={t('play_item', { title })}
    >
      <div className={posterClassNames} style={{ backgroundImage: posterSource ? `url(${posterSource})` : '' }}>
        {isCurrent && <div className={styles.currentLabel}>{currentLabel}</div>}
        {!loading && (
          <div className={styles.meta}>
            {featured && !disabled && enableTitle && <div className={classNames(styles.title, { [styles.loading]: loading })}>{title}</div>}
            <div className={styles.tags}>
              {isLocked && (
                <div className={classNames(styles.tag, styles.lock)} aria-label={t('card_lock')}>
                  <Lock />
                </div>
              )}
              {tag}
            </div>
          </div>
        )}
        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      {!featured && !disabled && enableTitle && (
        <div className={styles.titleContainer}>
          <div className={classNames(styles.title, { [styles.loading]: loading })}>{title}</div>
        </div>
      )}
    </div>
  );
}

export default memo(Card);
