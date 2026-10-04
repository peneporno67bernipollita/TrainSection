export const go = (path) => { location.hash = '#/' + String(path).replace(/^\//, ''); };
