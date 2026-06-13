/**
 * fileSystem.ts
 *
 * Disk usage by directory.  Single-unit (megabytes) so amount comparisons
 * are intuitive.  Demonstrates a deep, narrow tree.
 */
import type { BubbleNode } from '../../types/bubbleNode.js';

export const fileSystem: BubbleNode = {
  id: 'root',
  label: '/',
  amount: 12480,
  children: [
    {
      id: 'usr',
      label: '/usr',
      amount: 5800,
      children: [
        { id: 'usr-lib', label: 'lib', amount: 2400 },
        { id: 'usr-share', label: 'share', amount: 1800 },
        { id: 'usr-bin', label: 'bin', amount: 900 },
        { id: 'usr-local', label: 'local', amount: 700 },
      ],
    },
    {
      id: 'var',
      label: '/var',
      amount: 3200,
      children: [
        {
          id: 'var-log',
          label: 'log',
          amount: 1200,
          children: [
            { id: 'log-sys', label: 'syslog', amount: 400 },
            { id: 'log-app', label: 'app', amount: 500 },
            { id: 'log-archive', label: 'archive', amount: 300 },
          ],
        },
        { id: 'var-cache', label: 'cache', amount: 1100 },
        { id: 'var-lib', label: 'lib', amount: 900 },
      ],
    },
    {
      id: 'home',
      label: '/home',
      amount: 2480,
      children: [
        { id: 'home-alice', label: 'alice', amount: 1100 },
        { id: 'home-bob', label: 'bob', amount: 800 },
        { id: 'home-carol', label: 'carol', amount: 580 },
      ],
    },
    {
      id: 'opt',
      label: '/opt',
      amount: 1000,
    },
  ],
};
