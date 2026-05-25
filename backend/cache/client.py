import json
import logging
from django_redis import get_redis_connection
from redis.exceptions import RedisError

logger = logging.getLogger('animestreamer.cache')

class RedisCacheClient:
    _conn = None

    @classmethod
    def get_conn(cls):
        if not cls._conn:
            try:
                cls._conn = get_redis_connection("default")
            except Exception as e:
                logger.error("Failed to connect to Redis cache cluster", exc_info=True)
                raise e
        return cls._conn

    @classmethod
    def set_cached_object(cls, key: str, value: dict, ttl: int = 300):
        try:
            conn = cls.get_conn()
            if conn:
                conn.set(key, json.dumps(value), ex=ttl)
        except RedisError as e:
            logger.warn(f"Redis cache set failure: {key}. Details: {str(e)}")

    @classmethod
    def get_cached_object(cls, key: str) -> dict:
        try:
            conn = cls.get_conn()
            if conn:
                data = conn.get(key)
                if data:
                    return json.loads(data.decode('utf-8'))
        except RedisError as e:
            logger.warn(f"Redis cache get failure: {key}. Details: {str(e)}")
        return None

    @classmethod
    def invalidate(cls, key: str):
        try:
            conn = cls.get_conn()
            if conn:
                conn.delete(key)
        except RedisError as e:
            logger.warn(f"Redis cache invalidation failure: {key}. Details: {str(e)}")
