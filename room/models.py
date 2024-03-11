from django.db import models


class Room(models.Model, models.Manager):
    create_date = models.DateTimeField(auto_now_add=True)
    code = models.UUIDField(unique=True)
    
    class Meta:
        db_table = 'rooms'
        

class ChannelUser(models.Model, models.Manager):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    join_date = models.DateTimeField(auto_now_add=True)
    puuid = models.CharField(max_length=78)
    game_name = models.CharField(max_length=16)
    tag = models.CharField(max_length=8)
    owner = models.BooleanField()
    
    class Meta:
        db_table = 'channel_users'
