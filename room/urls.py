from django.urls import path
from . import views

app_name = 'room'

urlpatterns = [
    path('validate/user/', views.user_validation, name='user_validation'),
    path('validate/link/', views.room_validation, name='room_validation'),
    path('enter/', views.enter_room, name='enter_room'),
    path('<str:room_id>/', views.link_access, name='link_access'),
    path('<str:room_id>/<str:user_id>/', views.room_view, name='room_view'),
    path('<str:room_id>/<str:user_id>/detail/', views.fetch_user_detail, name='user_detail'),
    path('<str:room_id>/<str:user_id>/myprofile/change/lane/', views.change_lane, name='change_lane'),
    # path('<str:room_id>/<str:user_id>/manager/change/role/', views.change_role, name='change_role'),
    # path('<str:room_id>/<str:user_id>/chat/send/', views.send_chat, name='send_chat'),
    # path('<str:room_id>/<str:user_id>/system/send/new-user/', views.send_new_user, name='send_new_user'),
    path('<str:room_id>/<str:user_id>/system/fetch/old-users/', views.fetch_old_users, name='fetch_old_users'),
]