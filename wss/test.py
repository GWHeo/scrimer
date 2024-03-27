import redis


def get_connected_channels(key):
	redis_client = redis.StrictRedis(host='localhost', port=6379)
	pattern = 'asgi:group:'
	result = redis_client.keys(pattern + key)

	