from django.shortcuts import render, redirect
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import HttpResponseNotAllowed, HttpResponse, JsonResponse
from django.contrib.sites.shortcuts import get_current_site
from django.db.transaction import atomic
from django.core.serializers.json import DjangoJSONEncoder
from .models import Room, ChannelUser
from .forms import EnterRoom
from .decorators import method_only, room_api
from .external import request_get
from .shortcuts import send_change_ws_message
from wss.consumer import send_websocket_message, set_ws_send_data
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
@method_only('POST')
def user_validation(request):
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
    if response.status_code == 404:
        return HttpResponse(status=401)
    elif response.status_code != 200:
        return HttpResponse(response.status_code)
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
       

@method_only('POST')
def room_validation(request):
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


@method_only('POST')
def enter_room(request):
    form = EnterRoom(request.POST)
    if form.is_valid():
        room = Room.objects.get(code=form.cleaned_data['room_id'])
        user = ChannelUser.objects.get(room=room, game_name=form.cleaned_data['gamename'], tag=form.cleaned_data['tag'])
        return redirect('room:room_view', room_id=room.code, user_id=user.pk)
    return HttpResponse(status=400)


def room_view(request, room_id, user_id):
    try:
        user = ChannelUser.objects.get(id=user_id)
    except ObjectDoesNotExist:
        return redirect('common:index')
    path = request.build_absolute_uri().split('/')[:-2]
    invite_link = ''
    for p in path:
        invite_link += p + '/'
    ddragon_version_url = 'https://ddragon.leagueoflegends.com/api/versions.json'
    version_response = request_get(ddragon_version_url)
    version_latest = version_response.json()[0]
    ddragon_profile_icon_url = f"https://ddragon.leagueoflegends.com/cdn/{version_latest}/img/profileicon"
    ddragon_champ_json_url = f"https://ddragon.leagueoflegends.com/cdn/{version_latest}/data/ko_KR/champion.json"
    ddragon_champ_icon_url = f"https://ddragon.leagueoflegends.com/cdn/{version_latest}/img/champion"
    data = {
        'room_id': room_id,
        'channel_user': user,
        'invite_link': invite_link,
        'profile_icon_url': ddragon_profile_icon_url,
        'champ_json_url': ddragon_champ_json_url,
        'champ_icon_url': ddragon_champ_icon_url,
        'game_version': version_latest,
        'lane_choices': ChannelUser.LANE_CHOICES
    }
    return render(request, 'room/main.html', data)


'''
@method_only('POST')
@room_api
def send_chat(request, room_id, user_id):
    data = json.loads(request.body.decode('utf-8'))
    message = data['message']
    user = ChannelUser.objects.get(id=user_id)
    ws_data = set_ws_send_data('chat', 'onchange', {
        'userId': user.pk,
        'owner': user.owner,
        'role': user.role,
        'name': f"{user.game_name}#{user.tag}",
        'message': message
    })
    try:
        send_websocket_message(room_id, ws_data)
        return HttpResponse(status=200)
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500, safe=False)


@method_only('POST')
@room_api
def send_new_user(request, room_id, user_id):
    try:
        user = ChannelUser.objects.get(id=user_id)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
    try:
        send_change_ws_message(room_id, user, sender='system', message_type='newUser')
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500, safe=False)
    return HttpResponse(status=200)
'''


@method_only('GET')
@room_api
def fetch_old_users(request, room_id, user_id):
    room = Room.objects.get(code=room_id)
    old_users = ChannelUser.objects.filter(room=room).exclude(id=user_id)
    user_list = []
    for user in old_users:
        user_list.append({
            'userId': user.pk,
            'owner': user.owner,
            'role': user.role,
            'profileIconId': user.profile,
            'gameName': user.game_name,
            'tag': user.tag,
            'rank': user.rank,
            'most': user.most,
            'lane': user.lane
        })
    data = json.dumps(user_list, ensure_ascii=False, cls=DjangoJSONEncoder)
    return HttpResponse(data, status=200)


@method_only('GET')
@room_api
def fetch_user_detail(request, room_id, user_id):
    user = ChannelUser.objects.get(id=user_id)
    endpoints = settings.RIOT_API_ENDPOINTS
    
    # profile icon
    if user.profile is None:
        riot_summoner_url = f"{endpoints['summoner']}/{user.puuid}"
        detail_response = request_get(riot_summoner_url)
        data_json = detail_response.json()
        user.profile = data_json['profileIconId']
        user.summoner_id = data_json['id']
        user.save()
        data = {
            'profileIconId': data_json['profileIconId'],
            'summonerId': data_json['id'],
        }
    else:
        data = {
            'profileIconId': user.profile,
            'summonerId': user.summoner_id,
        }
    data['gameName'] = user.game_name
    data['tag'] = user.tag
    
    # rank info
    if user.rank is None:
        riot_rank_url = f"{endpoints['league']}/{data['summonerId']}"
        rank_response = request_get(riot_rank_url)
        rank = rank_response.json()
        user.rank = rank
        user.save()
    else:
        rank = user.rank
    data['rank'] = rank
    
    # most champion
    if user.most is None:
        riot_most_url = f"{endpoints['champion_mastery']}/{user.puuid}/top?count=1"
        most_response = request_get(riot_most_url)
        most = most_response.json()[0]['championId']
        user.most = most
        user.save()
    else:
        most = user.most
    data['most'] = most
    
    json_data = json.dumps(data, ensure_ascii=False, cls=DjangoJSONEncoder)
    return HttpResponse(json_data, status=200)


@method_only('POST')
@room_api
def change_lane(request, room_id, user_id):
    data = json.loads(request.body.decode('utf-8'))
    lane_values = [val[0] for val in ChannelUser.LANE_CHOICES]
    if data['laneSelect'] not in lane_values:
        return HttpResponse(status=403)
    user = ChannelUser.objects.filter(id=user_id)
    user.update(lane=data['laneSelect'])
    try:
        send_change_ws_message(room_id, user.first())
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500, safe=False)
    return HttpResponse(status=200)


'''
@method_only('POST')
@room_api
def change_role(request, room_id, user_id):
    data = json.loads(request.body.decode('utf-8'))
    role_value = data['role']
    user = ChannelUser.objects.get(id=data['userId'])
    user.role = role_value
    user.save()
    try:
        send_change_ws_message(room_id, user, message_type='changeRole')
    except Exception as e:
        return JsonResponse(json.dumps({'status': 'failed', 'message': str(e)}), status=500, safe=False)
    return HttpResponse(status=200)
'''