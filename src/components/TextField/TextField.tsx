import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './TextField.module.scss';

import HelperText from '#components/HelperText/HelperText';
import { testId as getTestId } from '#src/utils/common';
import useOpaqueId from '#src/hooks/useOpaqueId';

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

type TextAreaProps = {
  multiline: true;
} & React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

type Props = {
  className?: string;
  label?: string;
  helperText?: React.ReactNode;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  error?: boolean;
  editing?: boolean;
  testId?: string;
} & (InputProps | TextAreaProps);

const TextField: React.FC<Props> = ({ id, className, label, error, helperText, leftControl, rightControl, editing = true, testId, ...inputProps }: Props) => {
  const opaqueId = useOpaqueId('text-field', inputProps.name, id);
  const { t } = useTranslation('common');

  const textFieldClassName = classNames(
    styles.textField,
    {
      [styles.error]: error,
      [styles.disabled]: inputProps.disabled,
      [styles.leftControl]: !!leftControl,
      [styles.rightControl]: !!rightControl,
    },
    className,
  );

  return (
    <div className={textFieldClassName} data-testid={getTestId(testId)}>
      <label htmlFor={opaqueId} className={styles.label}>
        {label}
        {!inputProps.required && editing ? <span>{t('optional')}</span> : null}
      </label>
      {editing ? (
        <div className={styles.container}>
          {leftControl ? <div className={styles.control}>{leftControl}</div> : null}
          {'multiline' in inputProps ? (
            <textarea id={opaqueId} className={styles.input} rows={3} {...inputProps} />
          ) : (
            <input id={opaqueId} className={styles.input} type={'text'} {...inputProps} />
          )}
          {rightControl ? <div className={styles.control}>{rightControl}</div> : null}
        </div>
      ) : (
        <p>{inputProps.value}</p>
      )}
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default TextField;
