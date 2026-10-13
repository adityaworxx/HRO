import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      'components/**/*.{ts,tsx}',
      'app/**/*.{ts,tsx}',
      'features/**/components/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/mock/**', '@/services/mock', '@/fixtures/**', '@/fixtures'],
              message:
                'Direct imports from services/mock or fixtures into UI components/pages are forbidden by HRO architecture boundaries. Call service API hooks instead.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'pnpm-lock.yaml',
  ]),
]);

export default eslintConfig;
