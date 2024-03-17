from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from wss.routing import chat_url


def request_urls(request):
    http_domain = get_current_site(request).domain
    if settings.DEBUG:
        ws_protocol = 'ws'
    else:
        ws_protocol = 'wss'
    chat_ws_url = f'{ws_protocol}://{http_domain}/{chat_url}'
    fetch_user_info = reverse('room:user_validation')
    fetch_room_info = reverse('room:room_validation')
    return {
        'chat_ws_url': chat_ws_url,
        'user_info_url': fetch_user_info,
        'room_info_url': fetch_room_info,
    }
