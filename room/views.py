from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponseNotAllowed, HttpResponse
from .models import RoomCode, ChannelUser
import requests
import json
import time


def user_validation(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    data = json.loads(request.body.decode('utf-8'))
    game_name = data['gameName']
    tag = data['tag']
    
    # do request to riot api
    riot_account_url = f'https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag}'
    headers = {
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Riot-Token": settings.RIOT_TOKEN
    }
    response = requests.get(
        riot_account_url,
        headers=headers,
    )
    
    # create room code & puuid objects to db
    
    return HttpResponse('', status=response.status_code)
