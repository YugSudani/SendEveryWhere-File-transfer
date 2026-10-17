const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') console.info('[info]', ...args);
  },
  warn: (...args) => console.warn('[warn]', ...args),
  error: (...args) => console.error('[error]', ...args),
};

module.exports = logger;
