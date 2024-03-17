from django.shortcuts import render, redirect
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import HttpResponseNotAllowed, HttpResponse, JsonResponse
from django.contrib.sites.shortcuts import get_current_site
from .models import Room, ChannelUser
from .forms import EnterRoom
from wss.consumer import send_websocket_message
import requests
import json
import uuid
import time


def link_access(request, room_id):
    try:
        room = Room.objects.get(code=room_id)
    except (ObjectDoesNotExist, ValidationError):
        return HttpResponse(status=404)
    return render(request, 'index.html', {'link_access': True, 'room_id': room.code})


def user_validation(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    data = json.loads(request.body.decode('utf-8'))
    game_name = data['gameName']
    tag = data['tag']
    user_role = data['userRole']        # 'creator' or 'participant'
    if game_name == '' or tag == '':
        return HttpResponse(status=400)
    if user_role not in ['creator', 'participant']:
        return HttpResponse(status=404)
    
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
        user = ChannelUser.objects.get(game_name=game_name, tag=tag)
        room = user.room
        if user_role == 'participant' and room.code == data['roomId']:
            if not user.owner:
                raise ObjectDoesNotExist
        return JsonResponse({'roomId': room.code}, status=302)
    except ObjectDoesNotExist:
        if user_role == 'creator':
            room = Room.objects.create(code=uuid.uuid4())
        else:
            room = Room.objects.get(code=data['roomId'])
    user = ChannelUser.objects.create(
        room=room,
        puuid=user_data['puuid'],
        game_name=user_data['gameName'],
        tag=user_data['tagLine'],
        owner=True if user_role == 'creator' else False
    )
    
    return JsonResponse({'roomId': room.code}, status=200)


def room_validation(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    data = json.loads(request.body.decode('utf-8'))
    if data['link'] == '':
        return HttpResponse(status=400)
    link_info = data['link'].split('/')
    if len(link_info) != 6:
        return HttpResponse(status=404)
    domain = link_info[2]
    room_id = link_info[4]
    if domain != get_current_site(request).domain:
        return HttpResponse(status=403)
    try:
        room = Room.objects.get(code=room_id)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
    return JsonResponse({'roomId': room.code}, status=200)


def enter_room(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    form = EnterRoom(request.POST)
    if form.is_valid():
        room = Room.objects.get(code=form.cleaned_data['room_id'])
        user = ChannelUser.objects.get(room=room, game_name=form.cleaned_data['gamename'], tag=form.cleaned_data['tag'])
        return redirect('room:room_view', room_id=room.code, user_id=user.pk)
    return HttpResponse(status=400)


def room_view(request, room_id, user_id):
    user = ChannelUser.objects.get(id=user_id)
    data = {
        'room_id': room_id,
        'channel_user': user
    }
    return render(request, 'room/main.html', data)


def send_chat(request, room_id, user_id):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')
    data = json.loads(request.body.decode('utf-8'))
    message = data['message']
    user = ChannelUser.objects.get(id=user_id)
    try:
        send_websocket_message(
            room_id,
            False,
            user.pk,
            user.owner,
            user.role,
            f"{user.game_name}#{user.tag}",
            message
        )
        return HttpResponse(status=200)
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500)
        