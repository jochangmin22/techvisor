from utils import frequency_count

from ipclasses import IpMatrix
from usclasses import UsNlpToken

class UsMatrix(IpMatrix):
    def matrix_extract(self):
        def dict_keys_as_a_list():
            result = []
            for key in topics.keys():
                result.append(key)        
            return result

        foo = UsNlpToken(self._request, menu='matrix')
        bar = foo.nlp_token(self._mtxRowsNew)        

        topics = frequency_count(bar, self._output)
        return dict_keys_as_a_list()