from .base import *

DEBUG = False

STATIC_ROOT = BASE_DIR / 'static/'
STATICFILES_DIRS = []

ALLOWED_HOSTS = [
    '129.154.200.84',
    'www.scrimer.site'
]

CORS_ALLOWED_ORIGINS = [
    'https://www.scrimer.site'
]

CSRF_TRUSTED_ORIGINS = [
    'https://www.scrimer.site'
]
