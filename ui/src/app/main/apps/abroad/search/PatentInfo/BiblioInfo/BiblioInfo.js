import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { removeRedundunant } from 'app/main/apps/lib/utils';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function BiblioInfo(props) {
	const classes = useStyles(props);
	const ipcCpc = useSelector(({ abroadApp }) => abroadApp.search.ipcCpc);
	const item = props.search;

	const biblioInfo = {
		특허상태: item.등록사항,
		IPC: ipcCpc
			.filter(v => v.구분 === 'I')
			.map(v => v.코드)
			.reduce((text, value, i, array) => (i === 0 ? value : text + (i === 1 ? ' | ' : ' ; ') + value), ''),
		CPC: ipcCpc
			.filter(v => v.구분 === 'C')
			.map(v => v.코드)
			.reduce((text, value, i, array) => (i === 0 ? value : text + (i === 1 ? ' | ' : ' ; ') + value), ''),
		출원번호: (item.출원번호 ? item.출원번호 : '') + (item.출원일자 ? ' (' + item.출원일자 + ')' : ''),
		등록번호: (item.등록번호 ? item.등록번호 : '') + (item.등록일자 ? ' (' + item.등록일자 + ')' : ''),
		공개번호: (item.공개번호 ? item.공개번호 : '') + (item.공개일자 ? ' (' + item.공개일자 + ')' : ''),
		공고번호: (item.공고번호 ? item.공고번호 : '') + (item.공고일자 ? ' (' + item.공고일자 + ')' : ''),
		'존속기간(예상)만료일': item.소멸일자 ? item.소멸일자 : item.존속기간만료일자 ? item.존속기간만료일자 : '',
		출원인:
			removeRedundunant(item.출원인1) +
			' (' +
			item.출원인코드1 +
			')' +
			(item.출원인2 ? ', ' + removeRedundunant(item.출원인2) : '') +
			(item.출원인3 ? ', ' + removeRedundunant(item.출원인3) : ''),
		발명자: removeRedundunant(item.발명자1) + ' (' + (/^\d+$/.test(item.코드1) ? 'KR' : item.코드1) + ')'
	};

	function addSpanStyle(txt) {
		const regExp = /\(([^)]+)\)/;
		const matches = txt.match(regExp);
		const txtPart = txt.replace(regExp, '');

		return matches ? (
			<div className="flex flex-row items-center justify-start p-4 md:p-8">
				{txtPart}
				<span className="text-gray-500 pl-4">{matches[0]}</span>
			</div>
		) : (
			<div className="p-4 md:p-8">{txt}</div>
		);
	}

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12">
				<Typography className="p-12 text-14 font-bold">서지정보</Typography>
				{Object.entries(biblioInfo)
					.filter(([key, value]) => value !== '')
					.map(([key, value]) => (
						<Grid container key={key} spacing={2}>
							<Grid item xs={4} md={3}>
								<div className={clsx(classes.primaryColor, 'p-4 md:p-8')}>{key}</div>
							</Grid>
							<Grid item xs={8} md={9}>
								{addSpanStyle(value)}
								{/* <div className="p-4 md:p-8">{value}</div> */}
							</Grid>
						</Grid>
					))}
			</div>
		</Paper>
	);
}

export default BiblioInfo;
