from konlpy.tag import Mecab
from django.conf import settings

raw_len_limit = 50000
STOPWORDS = settings.TERMS['STOPWORDS']
STOPWORDS_PHRASE = settings.TERMS['STOPWORDS_PHRASE']

# NNG,NNP명사, SY기호, SL외국어, SH한자, UNKNOW (외래어일 가능성있음)
def tokenizer(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' raw token화 (raw_len_limit 단어 길이로 제한; 넘으면 mecab error)'''    
   
    # raw = remove_punc(remove_brackets(remove_tags(raw)))    
    mecab = Mecab()
    try:
        return [
            word
            for word, tag in mecab.pos(raw[:raw_len_limit]) if tag in pos and word not in STOPWORDS # and len(word) > 1
            # if len(word) > 1 and tag in pos and word not in stopword
            # if tag in pos
            # and not type(word) == float
        ]
    except:
        return []

def tokenizer_phrase(raw, pos=["NNG", "NNP", "SL", "SH", "UNKNOWN"]):
    ''' raw token화 (raw_len_limit 단어 길이로 분할 token화)'''
    if not raw:
        return []

    def _tokenizer(raw):
        def collected_exist():
            return True if '_' in saving and saving not in STOPWORDS_PHRASE else False
        def not_belong_to_stopword():
            return True if word not in STOPWORDS else False   
        def pos_kind_continues():
            return '_' + word if saving and close else word
        def belong_to_stopword_phrase(word):
            return True if word in STOPWORDS_PHRASE else False              
        # def rejoin_by_index(arr, alist):
        #     return '_'.join([i for i, x in enumerate(arr) if i in alist])
        # def condition(alist):
        #     return '_'.join([idx for idx, element in enumerate(a_list) if idx not in aList])

        # 조성물_청구_항, 조성물_삭제_삭제, 발현_벡터_발현_벡터
        def two_pair_remove_redundant():
            # A_A 
            foo = saving.split("_")
            if foo[0] == foo[1]:
                return foo[0]
            else:
                return saving
        def three_pair_remove_redundant():
            # A_A_A 
            # 1. 0_1 compare
            # 2. 1_2 compare
            # 3. 0_1 stop check
            # 4. 1_2 stop check
            foo = saving.split("_")
            if foo[0] == foo[1]:
                return f'{foo[0]}_{foo[2]}'
            if foo[1] == foo[2]:
                return f'{foo[0]}_{foo[2]}'
            if belong_to_stopword_phrase(f'{foo[0]}_{foo[1]}'):
                return foo[2]
            if belong_to_stopword_phrase(f'{foo[1]}_{foo[2]}'):
                return foo[0]
            return saving  

        def four_pair_remove_redundant():
            # A_A_A_A 발현_벡터_발현_벡터
            # 1. 0_1 compare
            # 2. 1_2 compare
                # 3. 2_3 compare
            # 4. 0_1  stop check
            # 5. 1_2  stop check
                # 6. 2_3 stop check
            foo = saving.split("_")
            if foo[0] == foo[1]:
                return f'{foo[0]}_{foo[2]}_{foo[3]}'
            if foo[1] == foo[2]:
                return f'{foo[0]}_{foo[2]}_{foo[3]}'
            if foo[2] == foo[3]:
                return f'{foo[0]}_{foo[1]}_{foo[2]}'                
            if belong_to_stopword_phrase(f'{foo[0]}_{foo[1]}'):
                return f'{foo[2]}_{foo[3]}'
            if belong_to_stopword_phrase(f'{foo[1]}_{foo[2]}'):
                return f'{foo[0]}_{foo[3]}'
            if belong_to_stopword_phrase(f'{foo[2]}_{foo[3]}'):
                return f'{foo[0]}_{foo[1]}'
            return saving                           

        mecab = Mecab()
        saving = ''
        close = None
        result = []
        for word, tag in mecab.pos(raw):
            if tag in pos:
                if not_belong_to_stopword():
                    saving += pos_kind_continues()
                    close=True
            else:
                close= False
                if saving:
                    if collected_exist():
                        command = { 1 :two_pair_remove_redundant, 2 :three_pair_remove_redundant, 3 : four_pair_remove_redundant }
                        count = saving.count('_')
                        if count > 0 and count < 4: 
                            foo = command[count]()   
                        else: # give up more then 5 pairs
                            foo = saving                            
                        result.append(foo)            
                    saving = ''
        return result    

    result = []
    # print(len(raw))
    # print(len(raw)/raw_len_limit)
    for i in range(0, len(raw), raw_len_limit):
        foo = _tokenizer(raw[i:i+raw_len_limit])
        result.extend(foo)
    return result

def tokenizer_sa(raw, pos=['VA','NNG','NNB','NNP','VCP','VCN','MAG','VV','XR','IC']):
    # 품사사용 참고 https://projectlog-eraser.tistory.com/19
    mecab = Mecab()
    try:
        return [
            word
            for word, tag in mecab.pos(raw[:raw_len_limit]) if tag in pos and word not in STOPWORDS # and len(word) > 1
        ]
    except:
        return []    
        