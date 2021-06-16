import spacy

nlp = spacy.load("en_core_web_sm", exclude=['parser','ner','entitiy_linker','entity_ruler','textcat','textcat_multilabel','lemmatizer','morphologizer','attribute_ruler','senter','tok2vec','transformer'])
# nlp = spacy.load("en_core_web_sm")

# spacy_stopwords = spacy.lang.en.stop_words.STOP_WORDS

from django.conf import settings
raw_len_limit = 50000
STOPWORDS = settings.ENG_TERMS['STOPWORDS']
STOPWORDS_PHRASE = settings.ENG_TERMS['STOPWORDS_PHRASE']


# def filtered_sentence(raw):
#     result = []
#     for word in raw:
#         lexeme = nlp.vocab[word]
#         if lexeme.is_stop == False:
#             result.append(word)
#     return result

def eng_tokenizer(raw, pos=["NN", "NNP", "NNPS", "NNS"]):
   
    doc = nlp(raw[:raw_len_limit])
    # doc = list(nlp.pipe(raw))[0]
    try:
        return [ w.text for w in doc if w.tag_ in pos and not w.is_stop and w.text not in STOPWORDS]
    except:
        return []

def eng_tokenizer_phrase(raw, pos=["NN", "NNP", "NNPS", "NNS"]):
    # [nsubj, nsubjpass, dobj, iobj, pobj]
    if not raw:
        return []

    def _tokenizer(raw):
        def collected_exist():
            return True if '_' in saving and saving not in STOPWORDS_PHRASE else False
        def not_belong_to_stopword():
            return True if word.text not in STOPWORDS and not word.is_stop else False   
        def pos_kind_continues():
            return '_' + word.text if saving and close else word.text
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

        saving = ''
        close = None
        result = []

        doc = nlp(raw[:raw_len_limit])
        # doc = list(nlp.pipe(raw))[0]
        for word in doc:
            if word.tag_ in pos:
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

def eng_tokenizer_sa(raw, pos=['NN', 'NNP', 'NNPS', 'NNS', 'VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'JJ', 'JJR', 'JJS']):
    # 명사, 동사, 형용사
    # 품사사용 참고 https://wikidocs.net/77166
    doc = nlp(raw[:raw_len_limit])
    # doc = list(nlp.pipe(raw))[0]
    try:
        return [
            word
            for word in doc if word.tag_ in pos and not word.is_stop and word.text not in STOPWORDS
        ]
    except:
        return []    
        