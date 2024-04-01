from django import forms
from .models import ChannelUser


class EnterRoom(forms.Form):
	gamename = forms.CharField(widget=forms.TextInput())
	tag = forms.CharField(widget=forms.TextInput())
	room_id = forms.CharField(widget=forms.HiddenInput())
	
