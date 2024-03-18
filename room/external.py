from django.conf import settings
import requests


def request_get(url):
	headers = {
		"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
		"X-Riot-Token": settings.RIOT_TOKEN
	}
	response = requests.get(
		url,
		headers=headers,
	)
	return response
