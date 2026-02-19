// On Vercel: use Redis only if REDIS_URL points to Upstash (serverless-friendly)
// Local: use REDIS_URL (Upstash or local Redis)
const isVercel = !!process.env.VERCEL;
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isUpstashUrl = redisUrl.includes('upstash.io');
const useRedis = !isVercel || (isVercel && isUpstashUrl);

let client;
let clearCarCache;

if (useRedis) {
    const { createClient } = require('redis');
    let url = redisUrl;
    if (isUpstashUrl && url.startsWith('redis://')) {
        url = url.replace('redis://', 'rediss://');
    }
    client = createClient({
        url: url,
        socket: {
            tls: url.startsWith('rediss://'),
            reconnectStrategy: (retries) => {
                if (retries > 100) {
                    console.log('Redis reached absolute max retries. Caching disabled.');
                    return false;
                }
                // Try every 2 seconds after initial flurries
                return Math.min(retries * 100, 5000);
            }
        }
    });
    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => console.log('Redis connected successfully'));
    (async () => {
        try {
            await client.connect();
        } catch (err) {
            console.error('Initial Redis connection failed. Backend will run without caching.');
        }
    })();
    clearCarCache = async () => {
        try {
            if (!client.isOpen) return;
            const oldKeys = await client.keys('driveease:cars:*');
            const newKeys = await client.keys('driveease:cache:*');
            const allKeys = [...oldKeys, ...newKeys];
            if (allKeys.length > 0) {
                await client.del(allKeys);
                console.log(`Cache cleared: ${allKeys.length} keys removed`);
            }
        } catch (err) {
            console.error('Error clearing car cache:', err);
        }
    };
} else {
    // Vercel without Upstash REDIS_URL - no caching
    client = { isOpen: false };
    clearCarCache = async () => { };
}

module.exports = {
    client,
    clearCarCache
};
