import json
import re
from itertools import permutations

def get_redis_key(request):
    "Return mainKey, subKey, params, subParams"
    params = request.GET.get('params','')
    params = json.loads(params)

    mainKey = "¶".join(params.values()) if params['searchNum'] == '' else params['searchNum']

    subParams = request.GET.get('subParams','')
    subParams = json.loads(subParams)


    # one more key to be used for a separated from searchParams
    subKey = mainKey + "¶".join(list(NestedDictValues(subParams))) if params['searchNum'] == '' else params['searchNum']   

    return mainKey, subKey, params, subParams

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]    

def NestedDictValues(d):
    for v in d.values():
        if isinstance(v, dict):
            yield from NestedDictValues(v)
        else:
            yield str(v)

TAG_RE = re.compile(r'<[^>]+>')

def remove_tags(text):
    return TAG_RE.sub('', text)


def remove_brackets(text):
    return re.sub("[\(\[].*?[\)\]]", "", text)


def remove_punc(text):
    return re.sub("[!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]", ' ', text)            

def str2round(value, num=1):
    try:
        value = float(value)
        return round(value, num)
    except ValueError:
        pass
    
    try:
        res = round(float(str.replace(",","")),num)
    except:
        res = 0
    return res

def str2int(value):
    try:
        value = int(value)
        return value
    except ValueError:
        pass
    
    try:
        res = int(value.replace(",",""))
    except:
        res = 0
    return res     

# def tsquery_parse(keyword=""):
#     """ like 검색안되서 일단 보류 200928 """
#     """ tsquery 생성 """
#     """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """

#     """ 
#     산업 : financialStatement - 산업코드 induty_code
#     시가총액 - listedCorp
#     설립일 - 공시 : 기업개황 - 설립일 (est_dt)
#     종업원수 - listedCorp
#     대표이사 나이 - 공시 : 사업보고서 주요정보 - 임원현황 - 임원 출생년월
#     """

#     # (기업이름).CN and (주소).CA and (사업영역).BD and (관련키워드).RK and (사용자).CC and (@MC>=1111<=2222) and (@FD>=33333333<=44444444) and (@EM>=55<=66) and (@RA>=77<=88)
#     if keyword and keyword != "":
#         needPlainto = ""
#         res = ""  # unquote(keyword) # ; issue fix
#         # for val in keyword.split(" AND "):
#         for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
#             # continue they were not implemented
#             # if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
#             if val.startswith("(@") or val.endswith(").CC"):
#                 continue

#             fieldName = '' # reset    
#             res += "("  # not add paranthesis when above terms
#             # select fieldName and remove initial symbol
#             if val.endswith(".CN"):
#                 val = val.replace(".CN", "")
#                 fieldName = '회사명'
#             if val.endswith(".CA"):
#                 val = val.replace(".CA", "")
#                 fieldName =  '지역'                
#             if val.endswith(".BD"):
#                 val = val.replace(".BD", "")
#                 fieldName ='업종'                
#             if val.endswith(".RK"):
#                 val = val.replace(".RK", "")
#                 fieldName = '주요제품'                
#             # if val.endswith(".IN"):
#             #     val = val.replace(".IN", "")
#             #     res += '산업'                
           
#             # convert nagative - to !
#             if val.startswith("-") or ' or -' in val:
#                 val = val.replace("-", "!")
#             # convert nagative not to !
#             if val.startswith("not ") or ' or not ' in val:
#                 val = val.replace("not ", "!")
#             # convert wildcard * to :*
#             if val.endswith("*") or '*' in val:
#                 val = val.replace("*", ":*")                
#             # handle Proximity Search
#             if ' adj' in val.lower():
#                 s = val.lower()[val.lower().find("adj")+3:].split()[0]
#                 if s.isnumeric():
#                     delimiter = "<" + s + ">"
#                     val = val.replace(s, "")
#                 else:
#                     delimiter = "<1>"

#                 val = re.sub(re.escape('adj'), delimiter, val, flags=re.IGNORECASE)                  

#             strNear = ""
#             if ' near' in val.lower():
#                 for v in re.split(" or ", val, flags=re.IGNORECASE):
#                     # remove possible parenthesis
#                     v = re.sub('[()]', '', v)
#                     if ' near' in v.lower():
#                         s = v.lower()[v.lower().find("near")+4:].split()[0]
#                         if s.isnumeric():
#                             delimiter = "<" + s + ">"
#                             v = v.replace(s, "")
#                         else:
#                             delimiter = "<1>"

#                         v = re.sub(re.escape('near'), delimiter, v, flags=re.IGNORECASE) 
#                         temp = v.partition(" " + delimiter + " ")

#                         # switch position between words and add it
#                         strNear += "(" + v + " | " + \
#                             temp[2] + " " + delimiter + " " + temp[0] + ") | "
#                     else:
#                         strNear += "".join(str(v)) + " | "
#                 if strNear.endswith(" | "):
#                     strNear = strNear[:-3]
#                 res += strNear
#                 val = ""  # val clear

#             # if " OR " in val:
#             if " or ".upper() in map(str.upper, val):
#                 needPlainto = "\""

#             # add paranthesis every terms block

#             res += (
#                 needPlainto + "".join(str(val)) + needPlainto + ") & "
#             )  

#         res = res.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
#             " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

#         if res.endswith(" & "):
#             res = res[:-3]

#         #  fieldName @@ plainto_tsquery('(A | B) & C')
#         tsqueryType = "plainto_tsquery" if needPlainto else "to_tsquery"
#         res = '"' + fieldName + "\" @@ " + \
#             tsqueryType + "('" + res + "')"                          
#     else:
#         res = None
#     return res     

def like_parse(keyword=""):
    """ like query 생성 """

    # (기업이름 and 기업이름2) and (주소).CA and (사업영역).BD and (관련키워드).RK and (사용자).CC and (@MC>=1111<=2222) and (@FD>=33333333<=44444444) and (@EM>=55<=66) and (@RA>=77<=88)
    if not keyword:
        return ""

    result = ""  # unquote(keyword) # ; issue fix
    # for val in keyword.split(" AND "):
    for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
        # temporarily continue they were not implemented
        # if val.startswith("(@") or val.endswith(").RK") or val.endswith(").CC"):
        if val.startswith("(@") or val.endswith(").CC"):
            continue

        fieldName = '회사명' # default    
        # res += "("  # not add paranthesis when above terms
        # select fieldName and remove initial symbol
        if val.endswith(".CA"):
            val = val.replace(".CA", "")
            fieldName =  '지역'                
        if val.endswith(".BD"):
            val = val.replace(".BD", "")
            fieldName ='업종'                
        if val.endswith(".RK"):
            val = val.replace(".RK", "")
            fieldName = '주요제품'               
        # if val.endswith(".IN"):
        #     val = val.replace(".IN", "")
        #     res += '산업'    
        
        val = re.sub('[()]', '', val)
         

        
        # 전체 조합에서 + 기준으로 like query 만들기
        items = []
        notItems = []
        mylength = 1
        # for val in re.split("(\\W+)", keyword): #  not a word (\w)
        for newVal in re.split(r' and | or ', val):  # and | or
            newVal = newVal.replace("_", " ")
            if "not " in newVal or "-" in newVal:  # collect negative word
                newVal = newVal.replace("-", "").replace("not ", "")
                notItems.append(newVal)
            else:
                items.append(newVal)

        temp = list(map("%".join, permutations(items, mylength)))

        res = ""
        for k in temp:
           res += '"' + fieldName + "\" like '%" + k + "%' or "

        if res.endswith(" or "):
            res = res[:-4]

        # append collect negative word
        res2 = ""
        # if not notItems:
        temp2 = list(map("%".join, permutations(notItems, mylength)))

        for k in temp2:
            res2 += '"' + fieldName + "\" not like '%" + k + "%' and "

        if res2.endswith(" and "):
            res2 = res2[:-5]

        # merge result
        if res:
            result += ("(" + res + ") and " + res2) if res2 else res
        else:
            result += res2 if res2 else ""
        result += ') and ('

    if result.endswith(" and ("):
        result = result[:-6]

    return result


    """ keyword 변환 => and, or, _, -, not, near, adj 를 tsquery 형식의 | & ! <1> 로 변경 """
    # A+B;C_D => '("A" | "B") & "C D"'
    # A or -B and C_D and not E => '(A !B) & "C D" & !E'
    if keyword and keyword != "":
        needPlainto = ""
        strKeyword = ""  # unquote(keyword) # ; issue fix

        # for val in keyword.split(" AND "):
        for val in re.split(" and ", keyword, flags=re.IGNORECASE):  # case insentitive
            # continue if not terms
            if val.startswith("(@") or val.endswith(".AP") or val.endswith(".INV") or val.endswith(".CRTY") or val.endswith(").LANG") or val.endswith(").STAT") or val.endswith(").TYPE"):
                continue
            strKeyword += "("  # not add paranthesis when above terms
            # convert nagative - to !
            if val.startswith("-") or ' or -' in val:
                val = val.replace("-", "!")
            # convert nagative not to !
            if val.startswith("not ") or ' or not ' in val:
                val = val.replace("not ", "!")
            # convert wildcard * to :*
            if val.endswith("*") or '*' in val:
                val = val.replace("*", ":*")
            # handle Proximity Search
            if ' adj' in val.lower():
                s = val.lower()[val.lower().find("adj")+3:].split()[0]
                if s.isnumeric():
                    delimiter = "<" + s + ">"
                    val = val.replace(s, "")
                else:
                    delimiter = "<1>"

                val = re.sub(re.escape('adj'), delimiter, val, flags=re.IGNORECASE)                    
                # val = val.replace("adj", delimiter)
            # A or B near C
            # A near B or C
            # A or B near C or D near E or F
            strNear = ""
            if ' near' in val.lower():
                for v in re.split(" or ", val, flags=re.IGNORECASE):
                    # remove possible parenthesis
                    v = re.sub('[()]', '', v)
                    if ' near' in v.lower():
                        s = v.lower()[v.lower().find("near")+4:].split()[0]
                        if s.isnumeric():
                            delimiter = "<" + s + ">"
                            v = v.replace(s, "")
                        else:
                            delimiter = "<1>"

                        v = re.sub(re.escape('near'), delimiter, v, flags=re.IGNORECASE) 
                        temp = v.partition(" " + delimiter + " ")

                        # switch position between words and add it
                        strNear += "(" + v + " | " + \
                            temp[2] + " " + delimiter + " " + temp[0] + ") | "
                    else:
                        strNear += "".join(str(v)) + " | "
                if strNear.endswith(" | "):
                    strNear = strNear[:-3]
                strKeyword += strNear
                val = ""  # val clear

            # if " OR " in val:
            if " or ".upper() in map(str.upper, val):
                needPlainto = "\""

            # add paranthesis every terms block

            strKeyword += (
                needPlainto + "".join(str(val)) + needPlainto + ") & "
            )
        strKeyword = strKeyword.replace(" AND ", needPlainto + " & ").replace(" OR ", needPlainto + " | ").replace(
            " and ", needPlainto + " & ").replace(" or ", needPlainto + " | ")  # .replace("_", " ")

        if strKeyword.endswith(" & "):
            strKeyword = strKeyword[:-3]

        #  전문소 @@ plainto_tsquery('(A | B) & C')
        tsqueryType = "plainto_tsquery" if needPlainto else "to_tsquery"
        res = '"' + fieldName + "\" @@ " + \
            tsqueryType + "('" + strKeyword + "')"
    else:
        res = None
    return res    