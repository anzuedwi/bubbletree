/**
 * .storybook/preview.ts
 *
 * Global Storybook configuration. Registers all custom elements and pulls
 * in the BubbleTree CSS so every story renders consistently.
 */
import type { Preview } from '@storybook/web-components';

import '../src/components/index.js';
import '../src/styles/bubbletree.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
};

export default preview;
