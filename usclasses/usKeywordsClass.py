from utils import frequency_count

from ipclasses import IpKeywords
from usclasses import UsNlpToken

class UsKeywords(IpKeywords):
    def keywords_extract(self):
        foo = UsNlpToken(self._request, menu='keywords')
        self._nlp_token = foo.nlp_token(self._nlpRows)

        return frequency_count(self._nlp_token, self._output)
