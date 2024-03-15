from django.urls import path
from . import views

app_name = 'room'

urlpatterns = [
    path('validate/user/', views.user_validation, name='user_validation'),
    path('validate/link/', views.room_validation, name='room_validation'),
    path('enter/', views.enter_room, name='enter_room'),
    path('<str:room_id>/', views.link_access, name='link_access'),
    path('<str:room_id>/<str:user_id>/', views.room_view, name='room_view')
]