from django.shortcuts import render, redirect
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import HttpResponseNotAllowed, HttpResponse, JsonResponse
from django.contrib.sites.shortcuts import get_current_site
from django.db.transaction import atomic
from .models import Room, ChannelUser
from .forms import EnterRoom
from .external import request_get
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


@atomic
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
        return HttpResponse(status=403)
    
    # do request to riot api
    riot_account_url = f'{settings.RIOT_API_ENDPOINTS["account"]}/{game_name}/{tag}'
    response = request_get(riot_account_url)
    if response.status_code != 200:
        return HttpResponse(status=response.status_code)
    user_data = response.json()

    # user save
    if user_role == 'creator':
        channel_user = ChannelUser.objects.filter(game_name=game_name, tag=tag, owner=True)
        if channel_user.exists():
            for user in channel_user:
                return JsonResponse({'roomId': user.room.code}, status=302)
        room = Room.objects.create(code=uuid.uuid4())
        ChannelUser.objects.create(
            room=room,
            puuid=user_data['puuid'],
            game_name=user_data['gameName'],
            tag=user_data['tagLine'],
            owner=True,
            role='participant',
        )
        return JsonResponse({'roomId': room.code}, status=200)
    
    elif user_role == 'participant':
        try:
            room = Room.objects.filter(code=data['roomId']).first()
            if not room.exists():
                raise ObjectDoesNotExist
        except (ObjectDoesNotExist, ValidationError):
            return HttpResponse(status=404)
        user = ChannelUser.objects.filter(game_name=game_name, tag=tag, room=room)
        if user.exists():
            return JsonResponse({'roomId': room.code}, status=302)
        else:
            ChannelUser.objects.create(
                room=room,
                puuid=user_data['puuid'],
                game_name=user_data['gameName'],
                tag=user_data['tagLine'],
                owner=False,
                role='participant',
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
    path = request.build_absolute_uri().split('/')[:-2]
    invite_link = ''
    for p in path:
        invite_link += p + '/'
    ddragon_version_url = 'https://ddragon.leagueoflegends.com/api/versions.json'
    version_response = request_get(ddragon_version_url)
    version_latest = version_response.json()[0]
    ddragon_profile_icon_url = f"https://ddragon.leagueoflegends.com/cdn/{version_latest}/img/profileicon"
    data = {
        'room_id': room_id,
        'channel_user': user,
        'invite_link': invite_link,
        'profile_icon_url': ddragon_profile_icon_url
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
            room_id=room_id,
            is_system=False,
            user_id=user.pk,
            owner=user.owner,
            role=user.role,
            name=f"{user.game_name}#{user.tag}",
            message=message
        )
        return HttpResponse(status=200)
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500)
        
        
def fetch_user_detail(request, room_id, user_id):
    if request.method != 'GET':
        return HttpResponseNotAllowed('GET')
    try:
        user = ChannelUser.objects.get(id=user_id)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
    riot_summoner_url = f"{settings.RIOT_API_ENDPOINTS['summoner']}/{user.puuid}"
    response = request_get(riot_summoner_url)
    data = response.json()
    data['gameName'] = user.game_name
    data['tag'] = user.tag
    return JsonResponse(json.dumps(data), status=response.status_code, safe=False)
