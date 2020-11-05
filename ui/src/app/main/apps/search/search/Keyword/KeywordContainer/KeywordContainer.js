import React from 'react';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import KeywordAnalysis from '../KeywordAnalysis';
import WordCloudChart from '../WordCloudChart';
import RelatedKeyword from '../RelatedKeyword';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	paper: {
		backgroundColor: theme.palette.background.paper
	}
}));

function getMapKeyValueByIndex(obj) {
	let newObj = [];
	// min value greater then 1
	Object.entries(obj).forEach(([key, value]) => value > 1 && newObj.push({ name: key, value: value }));
	return newObj;
}

function KeywordContainer() {
	const classes = useStyles();
	const search = useSelector(({ searchApp }) => searchApp.search.search);
	const { 전문소token, 청구항종류, 청구항들, descPart } = search;
	// 연관 키워드
	const keyword = 전문소token.split(' ').reduce((acc, it) => ({ ...acc, [it]: (acc[it] || 0) + 1 }), {});
	const wordCloud = getMapKeyValueByIndex(keyword);

	// 독립 청구항 단어수
	let independent = 0;
	청구항종류
		.map((e, i) => (e === 'dok' ? i : ''))
		.filter(String)
		.map(e => {
			return (independent += 청구항들[e].split(' ').length);
		});

	// 발명의 설명 단어수
	let description = 0;
	descPart.map(e => {
		return (description += search[e].split(' ').length);
	});

	// 종속 청구항 평균 단어수
	let dependent = 0;
	let data = 청구항종류.map((e, i) => (e === 'jong' ? i : '')).filter(String);
	data.map(e => {
		return (dependent += 청구항들[e].split(' ').length / data.length);
	});
	dependent = dependent.toFixed(0);

	const keywordInfo = {
		'독립 청구항': independent,
		'발명의 설명': description.toLocaleString(),
		'종속항의 평균': dependent,
		요약: search.초록.split(' ').length
	};

	const isEmpty = Object.values(search).every(x => x === null || x === '');

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			{isEmpty ? (
				<SpinLoading />
			) : (
				<>
					<div className="flex w-full md:w-1/3 pr-12">
						<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
							<div className="flex flex-col items-start p-12">
								<Typography className="text-14 p-12 font-bold">키워드 분석</Typography>
								<KeywordAnalysis keywordInfo={keywordInfo} />
							</div>
						</div>
					</div>
					<div className="flex w-full md:w-1/3 pr-12">
						<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
							<div className="flex flex-col items-start p-12">
								<h6 className="font-600 text-14 p-16" color="secondary">
									연관 키워드
								</h6>
								<RelatedKeyword wordCloud={wordCloud} />
							</div>
						</div>
					</div>
					<div className="flex w-full md:w-1/3">
						<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
							<div className="flex flex-col items-start p-12">
								<h6 className="font-600 text-14 p-16" color="secondary">
									워드 클라우드
								</h6>
								<WordCloudChart wordCloud={wordCloud} />
							</div>
						</div>
					</div>
				</>
			)}
		</FuseAnimateGroup>
	);
}

export default KeywordContainer;
