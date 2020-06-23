import React from 'react';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import WordCloud from './WordCloud';

const useStyles = makeStyles(theme => ({
	table: {
		'& th': {
			padding: '4px 0',
			color: theme.palette.primary.main,
			fontWeight: 500
		}
	},
	primaryColor: {
		color: theme.palette.primary.main
	},
	chip: {
		margin: theme.spacing(0.5)
	}
}));

function getMapKeyValueByIndex(obj) {
	let newObj = [];
	// min value greater then 1
	Object.entries(obj).forEach(([key, value]) => value > 1 && newObj.push({ text: key, value: value }));
	return newObj;
}

function Keyword(props) {
	const classes = useStyles(props);
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
		'독립 청구항' : independent,
		'발명의 설명' : description.toLocaleString(),
		'종속항의 평균' : dependent,
		요약 : props.search.초록.split(' ').length,
	}

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
							<Typography className="text-14 p-12 font-bold">
								키워드 분석
							</Typography>
							{Object.entries(keywordInfo).map(([key, value]) => (
								<Grid container key={key} spacing={3}>
									<Grid item xs={6}>
										<div className={clsx(classes.primaryColor, "p-4 md:p-8")}>{key} 단어 수</div>
									</Grid>
									<Grid item xs={6}>
										<div className="p-4 md:p-8 text-base">{value}</div>
									</Grid>
								</Grid>
							))}
						</div>
					</Paper>
				</div>
				<div className="flex w-full sm:w-1/3 pr-12">
					<Paper className="w-full rounded-8 shadow mb-16">
						<div className="flex flex-col items-start p-12">
							<h6 className="font-600 text-14 p-16" color="secondary">
								연관 키워드
							</h6>
							<div className="px-16">
								{wordCloud.map(data => {
									return (
										<Chip
											key={data.text}
											// icon={icon}
											label={data.text}
											className={classes.chip}
										/>
									);
								})}
							</div>
							{/* <div className="table-responsive px-16">
								<table className={clsx(classes.table, 'w-full text-justify dense')}>
									<tbody>
                                        {wordCloud.map( word => (
										    <tr key={word.text}>
											    <th>{word.text}</th>
										    </tr>
                                        ))}
									</tbody>
								</table>
							</div> */}
						</div>
					</Paper>
				</div>
				<div className="flex w-full sm:w-1/3">
					<Paper className="w-full rounded-8 shadow mb-16">
						<div className="flex flex-col items-start p-12">
							<h6 className="font-600 text-14 p-16" color="secondary">
								워드 클라우드
							</h6>
							<WordCloud wordCloud={wordCloud} />
						</div>
					</Paper>
				</div>
			</>
		</FuseAnimateGroup>
	);
}

export default Keyword;
