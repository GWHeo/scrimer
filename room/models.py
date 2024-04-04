from django.db import models


class Room(models.Model, models.Manager):
    create_date = models.DateTimeField(auto_now_add=True)
    code = models.UUIDField(unique=True)
    max_participants = models.IntegerField(default=10)
    status = models.CharField(max_length=8, default='ready', help_text="ready, progress, complete")
    
    class Meta:
        db_table = 'rooms'
        

class ChannelUser(models.Model, models.Manager):
    ROLE_CHOICES = [
        ('leader', '주장'),
        ('participant', '참가자')
    ]
    LANE_CHOICES = [
        ('any', '상관 없음'),
        ('top', '탑'),
        ('mid', '미드'),
        ('bot', '원딜'),
        ('support', '서포터'),
        ('jungle', '정글')
    ]
    ip = models.GenericIPAddressField(default=None, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    join_date = models.DateTimeField(auto_now_add=True)
    puuid = models.CharField(max_length=78)
    summoner_id = models.CharField(max_length=63, default=None, null=True)
    game_name = models.CharField(max_length=16)
    tag = models.CharField(max_length=8)
    owner = models.BooleanField()
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='participant')
    profile = models.IntegerField(null=True, default=None)
    rank = models.JSONField(null=True, default=None)
    most = models.IntegerField(null=True, default=None)
    lane = models.CharField(max_length=7, choices=LANE_CHOICES, default='any')
    wins = models.IntegerField(null=True, default=None)
    looses = models.IntegerField(null=True, default=None)

    class Meta:
        db_table = 'channel_users'
