from django.urls import re_path
from .consumer import ChatConsumer


chat_url = 'ws/chat/'

websocket_urlpatterns = [
    re_path(r"^ws/chat/(?P<room_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$", ChatConsumer.as_asgi())
]
