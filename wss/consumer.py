from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from asgiref.sync import async_to_sync, sync_to_async
from room.models import ChannelUser
import redis
import json
from pprint import pprint


def set_ws_send_data(type, status, data):
    return {
        'type': 'ws.send',
        'message': {
            'type': type,
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
        user = await sync_to_async(ChannelUser.objects.get)(id=self.user_id)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'ws.send',
                'message': set_ws_send_data('system', 'connect', {
                    'userId': self.user_id,
                    'name': f"{user.game_name}#{user.tag}"
                })
            }
        )
        
    async def disconnect(self, code):
        user = await sync_to_async(ChannelUser.objects.get)(id=self.user_id)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'ws.send',
                'message': set_ws_send_data('system', 'disconnect', {
                    'userId': self.user_id,
                    'name': f"{user.game_name}#{user.tag}"
                })
            }
        )
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        
    async def ws_send(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }, default=str))
        

def send_websocket_message(room_id, data):
    channel_layer = get_channel_layer()
    '''
    context = {
        'type': 'chat.send',
        'message': {
            'isSystem': is_system,
            'userId': user_id,
            'owner': owner,
            'role': role,
            'name': name,
            'context': message,
        }
    }
    '''
    async_to_sync(channel_layer.group_send)(
        room_id,
        {
            'type': 'ws.send',
            'message': data
        }
    )
    

def send_system_message(room_id, message):
    channel_layer = get_channel_layer()
    context = {
        'type': 'system.send',
        'message': {
            'status': 'onchange',
            'context': message
        }
    }
    async_to_sync(channel_layer.group_send)(
        room_id + '@system',
        context
    )
    