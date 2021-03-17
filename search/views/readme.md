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
