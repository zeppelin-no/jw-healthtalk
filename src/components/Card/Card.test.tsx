import * as React from 'react';
import { render } from '@testing-library/react';

import Card from './Card';

import DurationTag from '#src/components/Tag/DurationTag';
import CardTag from '#src/components/Tag/CardTag';
import type { PlaylistItem } from '#types/playlist';
import { renderWithi18n } from '#test/testUtils';

test('renders card with video title', async () => {
  const { container } = await renderWithi18n(<Card title="aa" tag={<DurationTag seconds={120} />} onClick={() => ''} />);
  expect(container).toMatchSnapshot();
});

test('Tag renders tag with Season and Episode', async () => {
  const { container } = await renderWithi18n(<CardTag item={{ seasonNumber: '2', episodeNumber: '5' } as PlaylistItem} />);
  expect(container).toMatchSnapshot();
});

test('Tag renders tag with Episode', async () => {
  const { container } = render(<CardTag item={{ episodeNumber: '5' } as PlaylistItem} />);
  expect(container).toMatchSnapshot();
});

test('Tag renders tag with Series', async () => {
  const { container } = render(<CardTag item={{ seriesId: '1235ABCD' } as PlaylistItem} />);
  expect(container).toMatchSnapshot();
});

test('Tag renders tag with duration', async () => {
  const { container } = render(<CardTag item={{ duration: 140 } as PlaylistItem} />);
  expect(container).toMatchSnapshot();
});

test('Tag renders tag with Live', async () => {
  const { container } = render(<CardTag item={{ duration: 0 } as PlaylistItem} />);
  expect(container).toMatchSnapshot();
});
