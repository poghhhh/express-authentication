module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './CleaningDuty.sqlite',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  test: {
    dialect: 'sqlite',
    storage: './CleaningDuty.sqlite',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    dialect: 'sqlite',
    storage: './CleaningDuty.sqlite',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
};
