from django.shortcuts import render
from django.http import FileResponse
from django.conf import settings


def index(request):
    return render(request, 'index.html', {'link_access': False})


def file_download(request, category, filename):
    file = open(f'static/images/{category}/{filename}', 'rb')
    return FileResponse(file)


def create_guide(request):
    return render(request, 'guide/create.html')


def participate_guide(request):
    return render(request, 'guide/participate.html')


def contact(request):
    urls = {
        'discord': settings.DISCORD_CHANNEL_URL,
        'kakaotalk': settings.KAKAO_OPENCHAT_URL
    }
    return render(request, 'contact.html', {'urls': urls})
