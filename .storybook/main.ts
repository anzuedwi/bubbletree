/**
 * .storybook/main.ts
 *
 * Storybook 8 configuration. Uses the Vite-powered web-components framework
 * so we can render Lit elements without a React runtime.
 */
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
};

export default config;
