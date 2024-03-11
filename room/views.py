from django.shortcuts import render, redirect
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseNotAllowed, HttpResponse, JsonResponse
from .models import Room, ChannelUser
from .forms import EnterRoom
import requests
import json
import uuid
import time


def user_validation(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    data = json.loads(request.body.decode('utf-8'))
    game_name = data['gameName']
    tag = data['tag']
    if game_name == '' or tag == '':
        return HttpResponse(status=400)
    
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
    if response.status_code != 200:
        return HttpResponse(status=response.status_code)
    user_data = response.json()
    try:
        user = ChannelUser.objects.get(game_name=game_name, tag=tag, owner=True)
        return HttpResponse(status=302)
    except ObjectDoesNotExist:
        room = Room.objects.create(code=uuid.uuid4())
    user = ChannelUser.objects.create(
        room=room,
        puuid=user_data['puuid'],
        game_name=user_data['gameName'],
        tag=user_data['tagLine'],
        owner=True
    )
    
    return JsonResponse({'roomId': room.code}, status=200)


def enter_room(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    form = EnterRoom(request.POST)
    if form.is_valid():
        room = Room.objects.get(code=form.cleaned_data['room_id'])
        user = ChannelUser.objects.get(room=room, game_name=form.cleaned_data['gamename'], tag=form.cleaned_data['tag'])
        return redirect('room:room_view', room_id=room.code, user_id=user.pk)
    return HttpResponse(status=404)


def room_view(request, room_id, user_id):
    print(room_id, user_id)
    return render(request, 'room/base.html')
