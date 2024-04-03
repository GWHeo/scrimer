from .base import *

DEBUG = False

STATIC_ROOT = BASE_DIR / 'static/'
STATICFILES_DIRS = []

ALLOWED_HOSTS = [
    '129.154.200.84'
]

CORS_ALLOWED_ORIGINS = [
    'http://129.154.200.84/'
]

CSRF_TRUSTED_ORIGINS = [
    'http://129.154.200.84/'
]
