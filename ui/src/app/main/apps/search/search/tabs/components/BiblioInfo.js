import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { addSeparator, removeRedundunant } from 'app/main/apps/lib/utils';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function BiblioInfo(props) {
	const classes = useStyles(props);

	const biblioInfo = {
		특허상태: props.search.등록사항,
		IPC: props.search.ipc코드,
		CPC: props.search.ipc코드,
		출원번호:
			addSeparator(props.search.출원번호, '-', 2, 6) +
			(props.search.출원일자 ? ' (' + addSeparator(props.search.출원일자, '.', 4, 6) + ')' : ''),
		등록번호:
			addSeparator(props.search.등록번호, '-', 2, 9) +
			(props.search.등록일자 ? ' (' + addSeparator(props.search.등록일자, '.', 4, 6) + ')' : ''),
		공개번호:
			addSeparator(props.search.공개번호, '-', 2, 6) +
			(props.search.공개일자 ? ' (' + addSeparator(props.search.공개일자, '.', 4, 6) + ')' : ''),
		공고번호:
			addSeparator(props.search.공고번호, '-', 2, 6) +
			(props.search.공고일자 ? ' (' + addSeparator(props.search.공고일자, '.', 4, 6) + ')' : ''),
		출원인:
			removeRedundunant(props.search.출원인1) +
			(props.search.출원인2 ? ', ' + removeRedundunant(props.search.출원인2) : '') +
			(props.search.출원인3 ? ', ' + removeRedundunant(props.search.출원인3) : ''),
		발명자: removeRedundunant(props.search.발명자)
	};

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12">
				<Typography className="p-12 text-14 font-bold">서지정보</Typography>
				{Object.entries(biblioInfo).map(([key, value]) => (
					<Grid container key={key} spacing={2}>
						<Grid item xs={4} md={2}>
							<div className={clsx(classes.primaryColor, 'p-4 md:p-8')}>{key}</div>
						</Grid>
						<Grid item xs={8} md={10}>
							<div className="p-4 md:p-8">{value}</div>
						</Grid>
					</Grid>
				))}
			</div>
		</Paper>
	);
}

export default BiblioInfo;
