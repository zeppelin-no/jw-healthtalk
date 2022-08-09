import { BrowserRouter as Router } from 'react-router-dom';
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderOptions } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import QueryProvider from '../src/providers/QueryProvider';

import * as en_US from '#src/i18n/locales/en_US';

interface WrapperProps {
  children?: ReactNode;
}

export const createWrapper = () => {
  const client = new QueryClient();

  return ({ children }: WrapperProps) => (
    <Router>
      <QueryClientProvider client={client}>{children as ReactElement}</QueryClientProvider>
    </Router>
  );
};

export const wrapper = ({ children }: WrapperProps) => (
  <Router>
    <QueryProvider>{children as ReactElement}</QueryProvider>
  </Router>
);

const renderWithRouter = (ui: ReactElement, options?: RenderOptions) => render(ui, { wrapper, ...options });

export const mockWindowLocation = (path: string) => {
  vi.stubGlobal('location', {
    pathname: path,
    assign: vi.fn(),
  });
};

export const i18nWrapper = ({ children }: WrapperProps) => {
  return <I18nextProvider i18n={i18next}>{children as ReactElement}</I18nextProvider>;
};

const renderWithi18n = async (ui: ReactElement, options?: RenderOptions) => {
  vi.unmock('react-i18next');

  await i18next.use(initReactI18next).init({
    resources: { 'en-US': en_US },
    lng: 'en-US',
  });

  const returnVal = render(ui, { wrapper: i18nWrapper, ...options });

  vi.restoreAllMocks();
  return returnVal;
};

export { renderWithRouter, renderWithi18n };
