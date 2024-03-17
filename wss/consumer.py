from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from asgiref.sync import async_to_sync
import redis
import json
from pprint import pprint


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.cache = redis.Redis(
            host=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][0],
            port=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][1]
        )

    async def connect(self):
        self.channel_layer.group_expiry = settings.SESSION_COOKIE_AGE
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        
    async def chat_send(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }, default=str))
        

def send_websocket_message(room_id, is_system, user_id, owner, role, name, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        room_id,
        {
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
    )
    