from django.urls import path
from . import views

app_name = 'room'

urlpatterns = [
    path('user/validate/', views.user_validation, name='user_validation'),
]