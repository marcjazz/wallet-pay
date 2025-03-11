const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m', // Info
  yellow: '\x1b[33m', // Warning
  red: '\x1b[31m', // Error
  green: '\x1b[32m', // Success
  purple: '\x1b[35m', // Debug
};

export const logger = {
  _log(level: keyof typeof colors, message: string): void {
    const color = colors[level] || colors.reset;
    console.log(
      `${color}[Logger]\x1b[0m ${color}${parseInt(
        `${Date.now() / 1e4}`
      )} - ${new Date().toUTCString()} - ${message}`
    );
  },

  log(message: string): void {
    logger._log('reset', message);
  },

  info(message: string): void {
    logger._log('blue', message);
  },

  warn(message: string): void {
    logger._log('yellow', message);
  },

  error(message: string): void {
    logger._log('red', message);
  },

  success(message: string): void {
    logger._log('green', message);
  },

  debug(message: string): void {
    logger._log('purple', message);
  },
};
