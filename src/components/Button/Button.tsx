import React, { MouseEventHandler } from 'react';
import classNames from 'classnames';
import { NavLink, NavLinkProps } from 'react-router-dom';

import styles from './Button.module.scss';

import Spinner from '#components/Spinner/Spinner';

type Color = 'default' | 'primary';

type Variant = 'contained' | 'outlined' | 'text';

type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type AnchorProps = {
  to: string;
} & NavLinkProps;

type Props = {
  children?: React.ReactNode;
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  variant?: Variant;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  busy?: boolean;
} & (ButtonProps | AnchorProps);

const Button: React.FC<Props> = ({
  label,
  children,
  color = 'default',
  startIcon,
  fullWidth = false,
  active = false,
  variant = 'outlined',
  size = 'medium',
  busy,
  className,
  disabled,
  ...elementProps
}: Props) => {
  const buttonClassName = (isActive: boolean) =>
    classNames(styles.button, className, styles[color], styles[variant], {
      [styles.active]: isActive,
      [styles.fullWidth]: fullWidth,
      [styles.large]: size === 'large',
      [styles.small]: size === 'small',
      [styles.disabled]: disabled,
    });

  const content = (
    <>
      {startIcon && <div className={styles.startIcon}>{startIcon}</div>}
      {<span className={classNames(styles.buttonLabel, { [styles.hidden]: busy }) || undefined}>{label}</span>}
      {children}
      {busy && <Spinner className={styles.centerAbsolute} size={'small'} />}
    </>
  );

  if ('to' in elementProps) {
    return (
      <NavLink className={({ isActive }) => buttonClassName(isActive)} {...elementProps} end>
        {content}
      </NavLink>
    );
  }

  return (
    <button className={buttonClassName(active)} disabled={disabled} aria-disabled={disabled} {...elementProps}>
      {content}
    </button>
  );
};
export default Button;
