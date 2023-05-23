export function errorWrapper(func) {
  return async (...args) => {
    try {
      await func(...args);
    } catch (err) {
      console.error(`error: ${err.message}`);
    }
  };
}
