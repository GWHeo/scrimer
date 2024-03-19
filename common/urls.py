from django.urls import path
from . import views

app_name = 'common'

urlpatterns = [
    path('', views.index, name='index'),
    path('file/<str:category>/<str:filename>/', views.file_download, name='file_download')
]
