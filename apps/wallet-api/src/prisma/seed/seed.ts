const nodeEnv = process.env.NODE_ENV;
console.log(`Node environement ${nodeEnv}`);
if (nodeEnv === 'test') {
  require('./test.seed');
} else require('./prod.seed');
