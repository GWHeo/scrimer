from django.urls import path
from . import views

app_name = 'room'

urlpatterns = [
    path('error/ip/', views.ip_error_view, name='ip_error'),
]