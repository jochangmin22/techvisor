from utils import  frequency_count 

from cpclasses import CpNlpToken
from ipclasses import IpWordcloud

class CpWordcloud(IpWordcloud):

    def wordcloud_extract(self):
        foo = CpNlpToken(self._request, menu='wordcloud')
        bar = foo.nlp_token(self._nlpRows)

        return frequency_count(bar, self._output)

