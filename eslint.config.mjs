import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'error',
    },
  },
];

export default eslintConfig;
