import baseConfig from '../jest.config.js';

export default {
  ...baseConfig,
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
  },
};
