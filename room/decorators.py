from django.http import HttpResponse, HttpResponseNotAllowed
from functools import wraps
from room.models import Room, ChannelUser


def method_only(method):
	def wrapper(func):
		@wraps(func)
		def view_func(request, *args, **kwargs):
			if request.method != method:
				return HttpResponseNotAllowed(method)
			return func(request, *args, **kwargs)
		return view_func
	return wrapper


def room_api(func):
	def wrapper(request, room_id, user_id):
		if not ChannelUser.objects.filter(id=user_id).exists():
			return HttpResponse('user not found', status=404)
		if not Room.objects.filter(code=room_id).exists():
			return HttpResponse('room not found', status=404)
		return func(request, room_id, user_id)
	return wrapper
