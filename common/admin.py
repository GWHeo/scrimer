from django.contrib import admin
from .models import *


@admin.register(RoomLog)
class RoomLogAdmin(admin.ModelAdmin):
    list_display = [
        'date',
        'room_code',
        'creator',
        'status'
    ]
    

@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    list_display = [
        'date',
        'room_code',
        'user',
        'is_creator',
        'status'
    ]
    

@admin.register(ActionLog)
class ActionLogAdmin(admin.ModelAdmin):
    list_display = [
        'date',
        'room_code',
        'mode'
    ]
