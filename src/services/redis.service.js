const redis = require("redis");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 10000,
});

const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 300)

const initRedis = async () => {
    await redisClient.connect();
    console.log("Redis conectado");
};

const setCache = async (key, data) => {
    const result = await redisClient.set(
        key,
        JSON.stringify(data),
        { EX: TTL }
    );
    console.log(`[Cache Set] ${key}`);
    return result;
};

const getCache = async (key) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
};

const delCache = async (key) => {
    console.log(`[Cache Deleted] ${key}`);
    return redisClient.del(key);
};


redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client conectado OK"));

module.exports = {initRedis, setCache, getCache, delCache};
