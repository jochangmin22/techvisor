"""
Django settings for techvisor project.

Generated by 'django-admin startproject' using Django 3.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
import datetime
import json
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

def get_json(setting, filename="secrets"):
    json_file = os.path.join(BASE_DIR, filename +'.json')

    with open(json_file) as f:
        secrets = json.loads(f.read())
    try:
        return secrets[setting]
    except:
        error_msg = "Set the {} environment variable".format(setting)
        raise ImproperlyConfigured(error_msg)


SECRET_KEY = get_json("SECRET_KEY")
KIPRIS = get_json("KIPRIS")
NAVER = get_json("NAVER")
DART = get_json("DART")
MFDS = get_json("MFDS")
JWT_AUTH = get_json("JWT_AUTH")
EMAIL = get_json("EMAIL")
ANYMAIL = get_json("ANYMAIL")
AWS = get_json("AWS")
GOOGLE = get_json("GOOGLE")
CELERY = get_json("CELERY")
CACHES = get_json('CACHES')
TERMS = get_json('TERMS', "default")
IAMPORT_KEY = get_json("IAMPORT")['IMP_KEY']
IAMPORT_SECRET = get_json("IAMPORT")['IMP_SECRET']
IAMPORT_CODE = get_json("IAMPORT")['IMP_CODE']



# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "192.168.0.50",
    "192.168.0.40",
    "btowin.synology.me",
    "14.32.114.185",
    "techvisor.co.kr",
    "v.techvisor.co.kr",
    "v2.techvisor.co.kr",
    "52.79.161.225",
    "14.32.114.185"
]

CORS_ORIGIN_ALLOW_ALL = True # Credential true
# frontend
CORS_ORIGIN_WHITELIST = [
    "http://192.168.0.40",
    "http://192.168.0.40:1000",
    "http://192.168.0.40:3000",
    "http://192.168.0.40:4000",
    "http://192.168.0.50",
    "http://192.168.0.50:1000",
    "http://192.168.0.50:3000",
    "http://192.168.0.50:4000",
    "http://localhost:1000",
    "http://localhost:3000",
    "http://localhost:4000",
    "http://127.0.0.1:8000",

    "http://btowin.synology.me:1000",
    "http://btowin.synology.me:1111",
    "http://btowin.synology.me:3000",
    "http://btowin.synology.me:4000",
    "http://btowin.synology.me:8000",
    "http://v.techvisor.co.kr:8000",
    "http://v.techvisor.co.kr:8001",
    "https://v.techvisor.co.kr",
    
    "http://14.32.114.185",  # company
    "https://14.32.114.185",
    "http://techvisor.co.kr",
    "http://www.techvisor.co.kr",
    "https://techvisor.co.kr",
    "http://techvisor.co.kr",
    "http://www.techvisor.co.kr",
    "https://techvisor.co.kr",

    "http://52.79.161.225",  # aws
    "https://52.79.161.225",
]

# If True, cookies will be allowed to be included in cross-site HTTP requests. Defaults to False.
CORS_ALLOW_CREDENTIALS = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    # "django_extensions",
    # app
    "search",
    "users",
    "company",
    "bill",
    # "django_user_agents",
    # "anymail",
    # "thsrs",
    # "applicant",
    # "extract",
    # "classify",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'django_user_agents.middleware.UserAgentMiddleware',
]

ROOT_URLCONF = 'techvisor.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # 'DIRS': [
        #     TEMPLATE_DIR,
        # ],
        'DIRS': [
            # os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'users/templates'),
            os.path.join(BASE_DIR, 'bill/templates')
            ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'techvisor.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

# Database postgresql
SECRET_DATABASE = get_json("DATABASES")
DATABASES = {
    'default': {
        "ENGINE": SECRET_DATABASE["company"]["ENGINE"],
        "NAME": SECRET_DATABASE["company"]["NAME"],
        "USER": SECRET_DATABASE["company"]["USER"],
        "PASSWORD": SECRET_DATABASE["company"]["PASSWORD"],
        "HOST": SECRET_DATABASE["company"]["HOST"],
        "PORT": SECRET_DATABASE["company"]["PORT"]
        # "ENGINE": SECRET_DATABASE["rds"]["ENGINE"],
        # "NAME": SECRET_DATABASE["rds"]["NAME"],
        # "USER": SECRET_DATABASE["rds"]["USER"],
        # "PASSWORD": SECRET_DATABASE["rds"]["PASSWORD"],
        # "HOST": SECRET_DATABASE["rds"]["HOST"],
        # "PORT": SECRET_DATABASE["rds"]["PORT"]
    }
}

EMAIL_BACKEND = EMAIL['EMAIL_BACKEND']
DEFAULT_FROM_EMAIL = EMAIL['DEFAULT_FROM_EMAIL']
SERVER_EMAIL = EMAIL['SERVER_EMAIL']

AWS_ACCESS_KEY_ID = AWS["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = AWS["AWS_SECRET_ACCESS_KEY"]
AWS_SES_REGION_NAME = AWS["AWS_SES_REGION_NAME"]
AWS_SES_REGION_ENDPOINT = AWS["AWS_SES_REGION_ENDPOINT"]

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

# LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'UTC'

# USE_I18N = True

# USE_L10N = True

# USE_TZ = True

LANGUAGE_CODE = "ko"
LANGUAGES = [("en", "English"), ("ko", "Korean")]
TIME_ZONE = "Asia/Seoul"
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
# STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), "static-cdn-local")

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly"
    ]
    # "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"]
    # "EXCEPTION_HANDLER": "techvisor.techvisor.custom_exception_handler",
}

# Additional options

# Cache time to live is 15 minutes.
CACHE_TTL = 60 * 15

TOKEN_EXPIRATION_DELTA = datetime.timedelta(days=1)
