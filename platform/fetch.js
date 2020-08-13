
let _fetch;

export const fetch = async (...args) => {
  if (!_fetch) {
    if (typeof window !== 'undefined') {
      _fetch = window.fetch;
    } else {
      //const nodeFetch = await import('../../node_modules/node-fetch/lib/index.mjs');
      const nodeFetch = await import('../node_modules/node-fetch/lib/index.mjs');
      _fetch = nodeFetch.default;
    }
  }
  return _fetch.apply(null, args);
};
