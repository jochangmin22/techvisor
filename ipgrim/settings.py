"""
Django settings for ipgrim project.

Generated by 'django-admin startproject' using Django 3.0.6.

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


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
secret_file = os.path.join(BASE_DIR, 'secrets.json')

with open(secret_file) as f:
    secrets = json.loads(f.read())


def get_secret(setting, secrets=secrets):
    try:
        return secrets[setting]
    except KeyError:
        error_msg = "Set the {} environment variable".format(setting)
        raise ImproperlyConfigured(error_msg)


SECRET_KEY = get_secret("SECRET_KEY")

KIPRIS = get_secret("KIPRIS")
DART = get_secret("DART")
NAVER = get_secret("NAVER")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["192.168.0.50", "192.168.0.40", "localhost", "btowin.iptime.org",
                 "btowin.synology.me", "14.63.15.149", "ipgrim.com", "v.ipgrim.com", "52.79.161.225"]

CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_WHITELIST = [
    "http://192.168.0.40",
    "http://192.168.0.40:1000",
    "http://192.168.0.40:3000",
    "http://192.168.0.40:3001",
    "http://192.168.0.50",
    "http://192.168.0.50:1000",
    "http://192.168.0.50:3000",
    "http://192.168.0.50:3001",
    "http://localhost:1000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:8000",
    "http://btowin.iptime.org:1000",
    "http://btowin.iptime.org:1111",
    "http://btowin.iptime.org:3000",
    "http://btowin.iptime.org:8000",
    "http://btowin.synology.me:1000",
    "http://btowin.synology.me:1111",
    "http://btowin.synology.me:3000",
    "http://btowin.synology.me:4000",
    "http://btowin.synology.me:8000",
    "http://v.ipgrim.com:8000",
    "http://v.ipgrim.com:8001",
    "https://v.ipgrim.com",
    "http://14.63.15.149",  # company
    "https://14.63.15.149",
    "http://ipgrim.com",
    "https://ipgrim.com",
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
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ipgrim.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'ipgrim.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

# Database postgresql
SECRET_DATABASE = get_secret("DATABASES")
DATABASES = {
    "default": {
        # "ENGINE": "django.db.backends.postgresql",
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "ipgrim",
        "USER": "ipgrim",
        "PASSWORD": SECRET_DATABASE["default"]["PASSWORD"],
        # "HOST": "192.168.0.50",
        "HOST": "localhost",
        "PORT": "5433",  # "5432",
    }
}


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
# STATICFILES_DIRS = [os.path.join(BASE_DIR, "staticfiles")]
# STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), "static-cdn-local")

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly"
    ]
    # "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"]
    # "EXCEPTION_HANDLER": "ipgrim.ipgrim.custom_exception_handler",
}

JWT_AUTH = {
    'JWT_SECRET_KEY': SECRET_KEY,
    'JWT_ALGORITHM': 'HS256',
    'JWT_ALLOW_REFRESH': True,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=7),
    'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=28),
}

ANYMAIL = {
    # (exact settings here depend on your ESP...)
    "MAILGUN_API_KEY": "ae8d20677a27e26fa7ace0a35931ff4a-915161b7-56a133f3",
    # your Mailgun domain, if needed
    "MAILGUN_SENDER_DOMAIN": 'sandbox7db8c28072ec4fc8ba1946d91358268e.mailgun.org',
}
# EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"  # or sendgrid.EmailBackend, or...
# DEFAULT_FROM_EMAIL = "mailgun@sandbox7db8c28072ec4fc8ba1946d91358268e.mailgun.org"  # if you don't already have this in settings
# SERVER_EMAIL = "mailgun@sandbox7db8c28072ec4fc8ba1946d91358268e.mailgun.org"  # ditto (default from-email for Django errors)

EMAIL_BACKEND = "django_ses.SESBackend"
DEFAULT_FROM_EMAIL = "jw1234@btowin.co.kr"
SERVER_EMAIL = "jw1234@btowin.co.kr"
AWS_ACCESS_KEY_ID = get_secret("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = get_secret("AWS_SECRET_ACCESS_KEY")
# AWS_SES_REGION_NAME = 'us-east-1'
# AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'

GOOGLE_JSON = os.path.join(BASE_DIR, 'client_secrets.json')
SECRET_GOOGLE = get_secret("GOOGLE")
GOOGLE_ID = SECRET_GOOGLE["client_id"]
GOOGLE_SECRET = SECRET_GOOGLE["client_secret"]
GOOGLE_PROJECT_ID = SECRET_GOOGLE["project_id"]

TOKEN_EXPIRATION_DELTA = datetime.timedelta(days=1)

# Cache time to live is 15 minutes.
CACHE_TTL = 60 * 15

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # "CONNECTION_POOL_KWARGS": {"max_connections": 10, "decode_responses": True},
        },
        "KEY_PREFIX": "ipgrim"
    }
}
stopwords = [
    ]
STOPWORDS = [
    '가',
    '가능',
    '감소',
    '걍',
    '경우',
    '과',
    '과제',
    '구동',
    '구비',
    '구성',
    '내부',
    '내지',
    '는',
    '단계',
    '도',
    '들',
    '를',
    '마련',
    '몸체',
    '발명',
    '발생',
    '방법',
    '배치',
    '분류',
    '사용',
    '사이',
    '상기',
    '상부',
    '상승',
    '선택',
    '세부',
    '수단',
    '신규',
    '실시',
    '에',
    '에서',
    '영역',
    '와',
    '요약',
    '용도',
    '유용',
    '으로',
    '은',
    '의',
    '의약',
    '이',
    '이상',
    '이용',
    '일부',
    '자',
    '잘',
    '장치',
    '적용',
    '제공',
    '제조',
    '좀',
    '종래',
    '증가',
    '처리',
    '특성',
    '특정',
    '특징',
    '포함',
    '필요',
    '하나',
    '하다'
    '하부',
    '한',
    '함유',
    '해결',
    '해당',
    '허용',
]

EXCLUDE_COMPANY_NAME =['가솔린', '가온', '강남', '강화', '갤럭시', '교차로', '그랜드', '그린', '나눔', '다정', '대덕', '대세', '대항', '디자인', '데일리', '동아', '동참', '마운틴', '미래', '라움', '라이프', '로드', '보양', '베스트', '비콘', '삼정', '상보', '소정', '솔라', '시티', '신안', '용현', '지디', '코로나', '코리아', '파트너', '포스트', '플랫폼', '플로', '플레이리스트', '헬스케어']             
