import React from 'react';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import WordCloud from './WordCloud';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
		width: '780',
		margin: '0 auto'
	},
	paper: {
		width: '100%',
		overflowX: 'auto'
	},
	tableRow: {
		fontSize: 11,
		fontWeight: 600
	},
	tableRowFixed: {
		width: '15%',
		fontSize: 11,
		fontWeight: 600
	},
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
							<h6 className="font-600 text-14 p-16" color="secondary">
								키워드 분석
							</h6>
							<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>키워드 정보</h6>
							<div className="table-responsive px-16">
								<table className={clsx(classes.table, 'w-full text-justify dense')}>
									<tbody>
										<tr>
											<th className="w-208">독립 청구항 단어 수</th>
											<td>{independent}</td>
										</tr>
										<tr>
											<th className="w-208">발명의 설명 단어 수</th>
											<td>{description.toLocaleString()}</td>
										</tr>
										<tr>
											<th className="w-208">종속항의 평균 단어 수</th>
											<td>{dependent}</td>
										</tr>
										<tr>
											<th className="w-208">요약 단어 수</th>
											<td>{props.search.초록.split(' ').length}</td>
										</tr>
									</tbody>
								</table>
							</div>
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
