from django.db import models


class Room(models.Model, models.Manager):
    create_date = models.DateTimeField(auto_now_add=True)
    code = models.UUIDField(unique=True)
    
    class Meta:
        db_table = 'rooms'
        

class ChannelUser(models.Model, models.Manager):
    ROLE_CHOICES = [
        ('leader', '주장'),
        ('participant', '참가자')
    ]
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    join_date = models.DateTimeField(auto_now_add=True)
    puuid = models.CharField(max_length=78)
    summoner_id = models.CharField(max_length=63, default=None, null=True)
    game_name = models.CharField(max_length=16)
    tag = models.CharField(max_length=8)
    owner = models.BooleanField()
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='participant')
    profile = models.IntegerField(null=True, default=None)
    #rank = models.TextField(default=None, null=True)
    rank = models.JSONField(null=True, default=None)
    most = models.IntegerField(null=True, default=None)
    lane = models.CharField(max_length=7, null=True, default=None)
    win_rate = models.FloatField(null=True, default=None)

    class Meta:
        db_table = 'channel_users'
