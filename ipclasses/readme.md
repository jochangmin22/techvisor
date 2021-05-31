# IpSearch 클래스

searchs : searchs.py -> IpSearchs('begin') -> \_rows 없으면 query -> paging_rows()

indicator : visual.py -> get_indicator - > IpIndicator -> IpSearchs(mode='indicator') -> foo.vis_ind() -> \_indRows -> indicator() -> elf.\_indicator

visual : visual.py -> IpVisual -> IpSearchs(mode=4가지) -> \_4가지 -> foo.vis_num, foo.vis_cla, foo.vis_ipc, foo.vis_per

matrix : matrix.py -> IpMatrix -> IpSearchs('matrix') -> \_mtx_rows = mtx_rows() -> self.\_nlpToken = NlpToken(menu='matrix') -> matrix()

keyword : nlp.py -> IpKeyword -> self.\_nlpToken = NlpToken(menu='keywords') -> keywords_extract() -> sentence_similarity() -> self.\_keywords

wordcloud : nlp.py -> IpWordcloud -> self.\_nlpToken = NlpToken(menu='wordcloud') -> wordcloud_extract() -> wordcloud_output() -> self.\_wordcloud
