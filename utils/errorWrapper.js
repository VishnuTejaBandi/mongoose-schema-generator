export function errorWrapper(func) {
  return async (...args) => {
    try {
      await func(...args);
    } catch (err) {
      if (process.env.DISPLAY_STACK_TRACE === 'true') {
        console.error(err);
      } else console.error(`error: ${err.message}`);
    }
  };
}
