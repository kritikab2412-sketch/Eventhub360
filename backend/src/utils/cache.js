const NodeCache = require('node-cache');

// Standard cache with TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const get = (key) => {
    return cache.get(key);
};

const set = (key, value) => {
    return cache.set(key, value);
};

const del = (key) => {
    return cache.del(key);
};

const flush = () => {
    return cache.flushAll();
};

module.exports = {
    get,
    set,
    del,
    flush
};
