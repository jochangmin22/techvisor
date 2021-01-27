import re
from itertools import permutations

selecting_columns = 'SELECT A.등록사항, A."발명의명칭(국문)", A."발명의명칭(영문)", A.출원번호, A.출원일자, A.출원인1, A.출원인코드1, A.출원인국가코드1, A.발명자1, A.발명자국가코드1, A.등록일자, A.공개일자, A.ipc요약, A.요약token, A.전체항token FROM '


def number_search(payload):
    res = selecting_columns + '공개공보 A WHERE '
    result = ""
    for field in ["출원번호", "공개번호", "등록번호"]: # fields without "-"
        result += f'{res} {field}::text like $$%{payload.replace("-","")}%$$ UNION '

    for field in ["우선권주장출원번호1", "우선권주장출원번호2", "우선권주장출원번호3", "우선권주장출원번호4", "우선권주장출원번호5", "우선권주장출원번호6", "우선권주장출원번호7", "우선권주장출원번호8", "우선권주장출원번호9", "우선권주장출원번호10"]: # fields with "-" ex) JP-P-2001-00053433
        result += f'{res} {field}::text like $$%{payload}%$$ UNION '

    result = result[:-7]
    return result

def string_search(str1, str2, str3, str4):
    str1 = f'({str1}) and ' if str1 else ''
    str2 = f'({str2}) and ' if str2 else ''
    str3 = f'({str3}) and ' if str3 else ''
    str4 = f'({str4}) and ' if str4 else ''

    res = selecting_columns + '공개공보 A WHERE '
    result = f'{res}{str1}{str2}{str3}{str4}'
    if result.endswith(" and "):
        result = result[:-5]

    return result + ' INTERSECT '

def like_applicant(payload):
    """ | & ! <1> -> LIKE OR 로 변경 """
    response = multi_like(payload, "성명")

    res = selecting_columns
    result = f'{res} ( SELECT 출원번호 FROM ( SELECT 출원번호 FROM 공개인명정보 WHERE {response} ) K GROUP BY 출원번호 ) V, 공개공보 A WHERE V.출원번호 = A.출원번호' 
    return result

def multi_like(str="", fieldName=""):
    """ like query or not like 생성 """

    # (A) & (B) & (C) & (D)
    # (A) & (!B) & (C) & (D)
    # ((A | B)) & (C) & (!D) & ((E <1> F))

    # 현재 not 만 처리하고 나머지는 or 로 묶음

    if not str:
        return ""

    # 전체 조합에서 + 기준으로 like query 만들기
    items = []
    notItems = []
    mylength = 1
    str = re.sub(r"[(|)]", "", str)
    for val in re.split(r' & | \| | <1> | <2> ', str):
        if "!" in val:  # collect negative word
            val = val.replace("!", "")
            notItems.append(val)
        else:
            items.append(val)

    temp = list(map("%".join, permutations(items, mylength)))

    result = ""
    for k in temp:
        result += '"' + fieldName + "\" like '%" + k + "%' or "

    if result.endswith(" or "):
        result = result[:-4]

    # append collect negative word
    result2 = ""
    # if not notItems:
    temp2 = list(map("%".join, permutations(notItems, mylength)))

    for k in temp2:
        result2 += '"' + fieldName + "\" not like '%" + k + "%' and "

    if result2.endswith(" and "):
        result2 = result2[:-5]

    # merge result
    if result:
        return ("(" + result + ") and " + result2) if result2 else result
    else:
        return result2 if result2 else ""    