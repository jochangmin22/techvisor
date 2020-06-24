import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { addSeparator } from 'app/main/apps/lib/utils';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Figures from './Figures';

const useStyles = makeStyles(theme => ({
	paper: {
		padding: '6px 16px'
	}
	// secondaryTail: {
	// 	backgroundColor: theme.palette.secondary.main
	// }
}));

function HistoryTimeLine(props) {
	const classes = useStyles();
	const { 출원일자, 공개일자, 등록일자 } = props.search;
	const title = ['출원', '공개', '등록'];
	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12">
				<Typography className="p-12 text-14 font-bold">출원 히스토리</Typography>
				<FuseScrollbars className="w-full max-h-192 px-6 flex-no-overflow">
					<Timeline align="alternate">
						{[출원일자, 공개일자, 등록일자]
							.filter(v => v)
							.map((key, n) => (
								<TimelineItem key={n}>
									<TimelineOppositeContent>
										<Typography variant="body2" color="textSecondary">
											{addSeparator(key, '.', 4, 6)}
										</Typography>
									</TimelineOppositeContent>
									<TimelineSeparator>
										<TimelineDot color="primary" variant="outlined" />
										<TimelineConnector />
									</TimelineSeparator>
									<TimelineContent>
										<Paper elevation={3} className={classes.paper}>
											{/* <Typography variant="h6" component="h1">Eat</Typography> */}
											<Typography>{title[n]}</Typography>
										</Paper>
									</TimelineContent>
								</TimelineItem>
							))}
					</Timeline>
				</FuseScrollbars>
			</div>
			<Typography className="text-14 px-16 py-8 font-bold" color="textSecondary">
				도면
			</Typography>
			<div className="px-16 py-8">
				<Figures className="mx-16 my-8" appNo={props.search.출원번호} />
			</div>
		</Paper>
	);
}

export default HistoryTimeLine;
