import React from 'react';
import Paper from '@material-ui/core/Paper';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Typography from '@material-ui/core/Typography';
import KeywordAnalysis from '../KeywordAnalysis';
import WordCloudChart from '../WordCloudChart';
import RelatedKeyword from '../RelatedKeyword';

function getMapKeyValueByIndex(obj) {
	let newObj = [];
	// min value greater then 1
	Object.entries(obj).forEach(([key, value]) => value > 1 && newObj.push({ name: key, value: value }));
	return newObj;
}

function KeywordContainer(props) {
	const { 전문소token, 청구항종류, 청구항들, descPart } = props.search;
	// 연관 키워드
	const keyword = 전문소token.split(' ').reduce((acc, it) => ({ ...acc, [it]: (acc[it] || 0) + 1 }), {});
	const wordCloud = getMapKeyValueByIndex(keyword);

	// 독립 청구항 단어수
	let data = 청구항종류.map((e, i) => (e === 'dok' ? i : '')).filter(String);
	let independent = 0;
	data.map(e => {
		return (independent += 청구항들[e].split(' ').length);
	});

	// 발명의 설명 단어수
	let description = 0;
	descPart.map(e => {
		return (description += props.search[e].split(' ').length);
	});

	// 종속 청구항 평균 단어수
	data = 청구항종류.map((e, i) => (e === 'jong' ? i : '')).filter(String);
	let dependent = 0;
	data.map(e => {
		return (dependent += 청구항들[e].split(' ').length / data.length);
	});
	dependent = dependent.toFixed(0);

	const keywordInfo = {
		'독립 청구항': independent,
		'발명의 설명': description.toLocaleString(),
		'종속항의 평균': dependent,
		요약: props.search.초록.split(' ').length
	};

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<>
				<div className="flex w-full sm:w-1/3 pr-12">
					<Paper className="w-full rounded-8 shadow mb-16">
						<div className="flex flex-col items-start p-12">
							<Typography className="text-14 p-12 font-bold">키워드 분석</Typography>
							<KeywordAnalysis keywordInfo={keywordInfo} />
						</div>
					</Paper>
				</div>
				<div className="flex w-full sm:w-1/3 pr-12">
					<Paper className="w-full rounded-8 shadow mb-16">
						<div className="flex flex-col items-start p-12">
							<h6 className="font-600 text-14 p-16" color="secondary">
								연관 키워드
							</h6>
							<RelatedKeyword wordCloud={wordCloud} />
						</div>
					</Paper>
				</div>
				<div className="flex w-full sm:w-1/3">
					<Paper className="w-full rounded-8 shadow mb-16">
						<div className="flex flex-col items-start p-12">
							<h6 className="font-600 text-14 p-16" color="secondary">
								워드 클라우드
							</h6>
							<WordCloudChart wordCloud={wordCloud} />
						</div>
					</Paper>
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default KeywordContainer;
