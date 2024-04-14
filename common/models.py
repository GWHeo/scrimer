from django.db import models
from room.models import ChannelUser


class RoomLog(models.Model, models.Manager):
    date = models.DateTimeField(auto_now_add=True)
    room_code = models.UUIDField()
    creator = models.CharField(max_length=25)
    status = models.CharField(max_length=7)     # 'created' or 'removed'
    
    class Meta:
        db_table = 'log_room'
        

class UserLog(models.Model, models.Manager):
    date = models.DateTimeField(auto_now_add=True)
    room_code = models.UUIDField()
    user = models.CharField(max_length=25)
    is_creator = models.BooleanField(default=False)
    status = models.CharField(max_length=12)      # 'connected' or 'disconnected'
    
    class Meta:
        db_table = 'log_user'
        
        
class ActionLog(models.Model, models.Manager):
    date = models.DateTimeField(auto_now_add=True)
    room_code = models.UUIDField()
    mode = models.CharField()                   # 'draft' or 'random' or 'auto' or 'reset'
    
    class Meta:
        db_table = 'log_action'
    