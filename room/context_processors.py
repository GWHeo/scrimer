from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings


def request_urls(request):
    http_domain = get_current_site(request).domain[:-1]
    fetch_user_info = reverse('room:user_validation')
    fetch_room_info = reverse('room:room_validation')
    return {
        'user_info_url': fetch_user_info,
        'room_info_url': fetch_room_info
    }
