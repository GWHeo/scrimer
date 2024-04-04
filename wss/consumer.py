from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import async_to_sync, sync_to_async
from room.models import ChannelUser, Room
import redis
import json


def set_ws_send_data(message_type, status, data):
    return {
        'type': 'ws.send',
        'message': {
            'type': message_type,
            'status': status,
            'data': data
        }
    }


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.user_id = None
        self.cache = redis.Redis(
            host=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][0],
            port=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][1]
        )

    async def connect(self):
        self.channel_layer.group_expiry = settings.SESSION_COOKIE_AGE
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()
        try:
            user = await sync_to_async(ChannelUser.objects.get)(id=self.user_id)
            ws_data = self.set_ws_data('system', 'connect', {
                'userId': self.user_id,
                'gameName': user.game_name,
                'tag': user.tag
            })
            await self.send_to_group(ws_data)
        except ObjectDoesNotExist:
            pass
            
    async def disconnect(self, code):
        # Normal Closure(1000) or Going away(1001)
        if code in [1000, 1001]:
            try:
                user = await ChannelUser.objects.aget(id=self.user_id)
            except ObjectDoesNotExist:
                return
            ws_data = self.set_ws_data('system', 'disconnect', {
                'userId': self.user_id,
                'owner': user.owner,
                'gameName': user.game_name,
                'tag': user.tag
            })
            if user.owner:
                await Room.objects.filter(code=self.room_name).adelete()
            await user.adelete()
            await self.send_to_group(ws_data)
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
        else:
            print(code)
        
    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        try:
            user = await ChannelUser.objects.aget(id=self.user_id)
        except ObjectDoesNotExist:
            return
        if data['type'] == 'chat':
            ws_data = self.set_ws_data('chat', 'onchange', {
                'userId': user.pk,
                'owner': user.owner,
                'role': user.role,
                'name': f"{user.game_name}#{user.tag}",
                'message': data['message']
            })
        elif data['type'] == 'newUser':
            ws_data = self.set_change_ws_message(user, message_type='newUser')
        elif data['type'] == 'changeRole':
            role_value = data['message']['role']
            change_user = await ChannelUser.objects.aget(id=data['message']['userId'])
            change_user.role = role_value
            await change_user.asave()
            ws_data = self.set_change_ws_message(change_user, message_type='changeRole')
        elif data['type'] == 'changeLane':
            user.lane = data['message']['laneSelect']
            await user.asave()
            ws_data = self.set_change_ws_message(user, message_type='onchange')
        elif data['type'] == 'changeMaxParticipants':
            room = await Room.objects.aget(code=self.room_name)
            room.max_participants = data['message']['value']
            await room.asave()
            ws_data = self.set_ws_data('system', 'changeMaxParticipants', {
                'value': room.max_participants
            })
        elif data['type'] == 'draftPick':
            room = await Room.objects.aget(code=self.room_name)
            if data['message']['step'] == 0:
                room.status = 'ready'
                await room.asave()
            elif data['message']['step'] == 1:
                room.status = 'progress'
                await room.asave()
            elif data['message']['step'] == 2:
                pass
            ws_data = self.set_ws_data('system', 'draftPick', data['message'])
        elif data['type'] == 'rspResult':
            value = data['message']['value']
            if value == '':
                import random
                choices = ['rock', 'scissor', 'paper']
                value = choices[random.randrange(0, 3)]
            ws_data = self.set_ws_data('system', 'rspResult', {
                'userId': data['message']['userId'],
                'value': value
            })
        else:
            ws_data = None
        await self.send_to_group(ws_data)
        
    async def ws_send(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }, default=str))
        
    async def send_to_group(self, data):
        await self.channel_layer.group_send(self.room_name, data)

    @staticmethod
    def set_ws_data(message_type, status, data):
        return {
            'type': 'ws.send',
            'message': {
                'type': message_type,
                'status': status,
                'data': data
            }
        }

    def set_change_ws_message(self, user, sender='system', message_type='onchange'):
        return self.set_ws_data(sender, message_type, {
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


def send_websocket_message(room_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        room_id,
        {
            'type': 'ws.send',
            'message': data
        }
    )
    