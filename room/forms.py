from django import forms


class EnterRoom(forms.Form):
	gamename = forms.CharField(widget=forms.TextInput())
	tag = forms.CharField(widget=forms.TextInput())
	room_id = forms.CharField(widget=forms.HiddenInput())
