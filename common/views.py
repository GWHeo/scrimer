from django.shortcuts import render
from django.http import FileResponse
import os


def index(request):
    return render(request, 'index.html', {'link_access': False})


def file_download(request, category, filename):
    file = open(f'static/images/{category}/{filename}', 'rb')
    return FileResponse(file)
