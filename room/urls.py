from django.urls import path
from . import views

app_name = 'room'

urlpatterns = [
    path('user/validate/', views.user_validation, name='user_validation'),
    path('enter/', views.enter_room, name='enter_room'),
    path('<str:room_id>/<str:user_id>/', views.room_view, name='room_view')
]