from utils import frequency_count

from ipclasses import IpWordcloud
from usclasses import UsNlpToken

class UsWordcloud(IpWordcloud):
    def wordcloud_extract(self):
        foo = UsNlpToken(self._request, menu='wordcloud')
        bar = foo.nlp_token(self._nlpRows)

        return frequency_count(bar, self._output)