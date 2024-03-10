from django.db import models


class RoomCode(models.Model):
    code = models.CharField(max_length=16, unique=True)
    
    class Meta:
        db_table = 'room_codes'
        

class ChannelUser(models.Model):
    room = models.ForeignKey(RoomCode, on_delete=models.CASCADE)
    puuid = models.CharField(max_length=78)
    
    class Meta:
        db_table = 'channel_users'
