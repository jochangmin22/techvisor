from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

from ipclasses import IpIndicator


class UsIndicator(IpIndicator):
    pass

