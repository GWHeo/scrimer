from django.urls import path
from . import views

app_name = 'common'

urlpatterns = [
    path('', views.index, name='index'),
    path('file/<str:category>/<str:filename>/', views.file_download, name='file_download'),
    path('guide/create/', views.create_guide, name='guide_create'),
    path('guide/participate/', views.participate_guide, name='guide_participate'),
    path('contact/', views.contact, name='contact')
]
