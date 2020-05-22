# 윕스 검색식 샘플

<pre><code>
((cycle) OR (hybrid) OR (engine)) (car)
const leftSiderTermsDB = {
    terms: [
        {
            terms: ["하이브리드", "자전거"],
            dateType: "출원일",
            startDate: "",
            endDate: "",
            inventor: ["홍길동", "강감찬"],
            assigne: ["이순신", "김수로"],
            patentOffice: ["KR", "JR"],
            language: ["한글", "영어"],
            status: "출원",
            type: "특허",
            litigation: "침해있음"
        }
    ]
};

(((PI 폴리이미드 Poly-imide Polyimide (poly adj imide) CPI).KEY,CLA. and (디스플레이 display 액정 표시장치 OLED O-LED 오엘이디 오앨이디 유기발광다이오드 (유기발광 adj 다이오드) (Organic adj Light adj Emitting adj Diode))) AND ((EN081508 EN072445 EN012270 UN001360 EN015559 EN011238 EN058403 EN004923 EN080852 EN007694 EN029230 EN015054 EN014659 EN045478 EN010362).WAP. or ((아사히 adj 가세이) (asahi adj kasei).AP.))) and BAFL

(
	(
		(
			PI 폴리이미드 Poly-imide Polyimide
			(
				poly adj imide
			)
			 CPI
		)
		.KEY,CLA. and
		(
			디스플레이 display 액정 표시장치 OLED O-LED 오엘이디 오앨이디 유기발광다이오드
			(
				유기발광 adj 다이오드
			)

			(
				Organic adj Light adj Emitting adj Diode
			)
		)
	)
	 AND
	(
		(
			EN081508 EN072445 EN012270 UN001360 EN015559 EN011238 EN058403 EN004923 EN080852 EN007694 EN029230 EN015054 EN014659 EN045478 EN010362
		)
		.WAP. or
		(
			(
				아사히 adj 가세이
			)

			(
				asahi adj kasei
			)
			.AP.
		)
	)
)
 and BAFL

</code></pre>

# 검색 기호 정리

단백질 AND 추출물 AND 정제 AND (@AD>=20160101<=20170101) AND (한국생명공학연구원 OR 한국 한의학 연구원).AP
AND (김).INV

(하이브리드 and 자동차).TI,AB,CL,TF,BT,IE,SM,SP. AND (삼성 or 현대).AP.

(Immunovative adj Therapies).AP. and (allogeneic 동종 동종이형 (동종 adj 이형) 동일) and (((Chimeric chimera) adj antigen adj receptor) ((키메릭 키메라) adj 항원 adj 수용체) CAR-T CAR-NK (natural adj killer) (자연 adj 살해))

(
Immunovative adj Therapies
)
.AP. and
(
allogeneic 동종 동종이형
(
동종 adj 이형
)
동일
)
and
(
(
(
Chimeric chimera
)
adj antigen adj receptor
)
(
(
키메릭 키메라
)
adj 항원 adj 수용체
)
CAR-T CAR-NK
(
natural adj killer
)
(
자연 adj 살해
)
)

# matrix

검색식 -> topic (20) -> 연관단어(10) -> m_raw 의 초록\_token filter -> 출원번호 list

topic: [전기,전지,자동차', '자전거', '구조', '하이브리드', '금속', '부재', '방전', '바퀴', '리튬', '외장', '조립', '외측', 연결', '축전지', '상태', '전압', '제어', '엔진'],

연관단어 : [리튬,금속,자동차,방전,전지,자전거,하이브리드,구조,바퀴,부재]

entities: [
{
'출원번호': '1020050047765',
'출원일자': '2005',
'출원인1': '주식회사 엘지화학',
'ipc요약': 'H01M'
'초록token': 'H01M'
},
