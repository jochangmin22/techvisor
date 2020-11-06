import React, { useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { removeRedundunant } from 'app/main/apps/lib/utils';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	color: {
		color: theme.palette.text.primary
	}
}));

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

function BiblioInfo() {
	const classes = useStyles();
	const ipcCpc = useSelector(({ searchApp }) => searchApp.search.ipcCpc);
	const search = useSelector(({ searchApp }) => searchApp.search.search);

	const biblioInfo = useMemo(
		() =>
			search
				? {
						특허상태: search.등록사항,
						IPC: ipcCpc
							.filter(v => v.구분 === 'I')
							.map(v => v.코드)
							.reduce(
								(text, value, i, array) => (i === 0 ? value : text + (i === 1 ? ' | ' : ' ; ') + value),
								''
							),
						CPC: ipcCpc
							.filter(v => v.구분 === 'C')
							.map(v => v.코드)
							.reduce(
								(text, value, i, array) => (i === 0 ? value : text + (i === 1 ? ' | ' : ' ; ') + value),
								''
							),
						출원번호:
							(search.출원번호 ? search.출원번호 : '') +
							(search.출원일자 ? ' (' + search.출원일자 + ')' : ''),
						등록번호:
							(search.등록번호 ? search.등록번호 : '') +
							(search.등록일자 ? ' (' + search.등록일자 + ')' : ''),
						공개번호:
							(search.공개번호 ? search.공개번호 : '') +
							(search.공개일자 ? ' (' + search.공개일자 + ')' : ''),
						공고번호:
							(search.공고번호 ? search.공고번호 : '') +
							(search.공고일자 ? ' (' + search.공고일자 + ')' : ''),
						'존속기간(예상)만료일': search.소멸일자
							? search.소멸일자
							: search.존속기간만료일자
							? search.존속기간만료일자
							: '',
						출원인:
							removeRedundunant(search.출원인1) +
							' (' +
							search.출원인코드1 +
							')' +
							(search.출원인2 ? ', ' + removeRedundunant(search.출원인2) : '') +
							(search.출원인3 ? ', ' + removeRedundunant(search.출원인3) : ''),
						발명자:
							removeRedundunant(search.발명자1) +
							' (' +
							(/^\d+$/.test(search.코드1) ? 'KR' : search.코드1) +
							')'
				  }
				: {},
		[search, ipcCpc]
	);

	return (
		<div className={clsx(classes.paper, 'w-full rounded-8 shadow mb-16')}>
			<div className="flex-col items-start p-12">
				<Typography className="p-12 text-14 font-bold">서지정보</Typography>
				{Object.entries(biblioInfo)
					.filter(([key, value]) => value !== '')
					.map(([key, value]) => (
						<Grid container key={key} spacing={2}>
							<Grid item xs={4} md={3}>
								<div className={clsx(classes.color, 'font-medium p-4 md:p-8')}>{key}</div>
							</Grid>
							<Grid item xs={8} md={9}>
								{addSpanStyle(value)}
								{/* <div className="p-4 md:p-8">{value}</div> */}
							</Grid>
						</Grid>
					))}
			</div>
		</div>
	);
}

export default BiblioInfo;
