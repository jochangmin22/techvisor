before

get_news -> redis (news) ? -> … -> save 1, save 2 -> api

get_news_nlp -> redis (news_nlp) ? -> get_news(string) -> … -> save -> string

related_company -> redis (company) ? -> get_news_nlp(string) -> … -> save -> api

get_news_sa -> redis (news_sa) ? -> get_news_nlp(string) -> … -> save -> api

after

paging : get_naver_news -> redis(naver) ? -> … -> save -> only string

paging : get_news -> redis (naver) ? -> … -> save -> api

get_news_nlp -> redis (news_nlp) ? -> get_naver_news(string) -> … -> save -> string

related_company -> redis (company) ? -> get_news_nlp(string) -> … -> save -> api

get_news_sa -> redis (news_sa) ? -> get_news_nlp(string) -> … -> save -> api

# IpSearch 클래스

1. IpSearch : kr_search
   \*. nlpClass : nlpToken
2. IpKeyword : get_vec -> keyword로 변경예정
3. IpIndicator : indicator
4. IpWordcloud : wordcloud
5. " : wordcloud_dialog -> kr_search 재활용

6. NewsSearch : news
7. NewsSa : news_sa
8. NewsCompany : Ipnews_related_company

9. IpMatrix : matrix
10. " matrix_dialog -> kr_search 재활용

11. IpVisual : visual
