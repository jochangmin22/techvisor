from utils import eng_tokenizer_phrase, remove_duplicates, eng_tokenizer
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

from ipclasses import IpNlpToken

class UsNlpToken(IpNlpToken):
    def nlp_token(self, nlpRows):

        def phrase_frequncy_tokenizer():
            return eng_tokenizer_phrase(nlp_str)

        def phrase_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(eng_tokenizer_phrase(foo))
                result.extend(bar)
            return result            

        def word_frequncy_tokenizer():
            return eng_tokenizer(nlp_str)

        def word_individual_tokenizer():
            for foo in nlp_list:
                bar = remove_duplicates(eng_tokenizer(foo))
                result.extend(bar)
            return result 

        try:
            result = getattr(self, '_%s_nlp' % self._menu)
        except AttributeError:
            pass
        else:
            return result            

        nlp_list = [d[self._volume] for d in nlpRows] # _voloume : '요약·청구항', '요약', '청구항', 
        nlp_str = ' '.join(nlp_list) if nlp_list else None

        result = []
        command = { '구문': { '빈도수':phrase_frequncy_tokenizer, '건수':phrase_individual_tokenizer }, '워드': { '빈도수' :word_frequncy_tokenizer, '건수':word_individual_tokenizer } }
        res = command[self._unit][self._emergence]()    
        res = [w.replace('_', ' ') for w in res]
        cache.set(f'{self._nlpKey}_nlp', res, CACHE_TTL)  
        return res