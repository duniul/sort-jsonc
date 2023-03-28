export default {
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>/src'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: { target: 'es2020' },
      },
    ],
  },
};
