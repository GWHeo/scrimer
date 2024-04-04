from django.urls import path
from . import views

app_name = 'errors'

urlpatterns = [
    path('ip/', views.ip_error_view, name='ip_error'),
]