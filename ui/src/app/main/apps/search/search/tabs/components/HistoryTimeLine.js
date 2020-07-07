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
	const { 출원일자, 공개일자, 등록일자, 소멸일자, 존속기간만료일자 } = props.search;
	const historyInfo = {
		출원: 출원일자,
		공개: 공개일자,
		등록: 등록일자,
		소멸: 소멸일자,
		존속기간만료: 소멸일자 === null ? 존속기간만료일자 : ''
	};
	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12 py-0">
				<Typography className="p-12 text-14 font-bold">출원 히스토리</Typography>
				<FuseScrollbars className="w-full max-h-192 px-6 flex-no-overflow">
					<Timeline align="alternate">
						{Object.entries(historyInfo)
							.filter(([_, value]) => value && value.length > 0)
							.map(([key, value]) => (
								<TimelineItem key={key}>
									<TimelineOppositeContent>
										<Typography variant="body2" color="textSecondary">
											{value}
										</Typography>
									</TimelineOppositeContent>
									<TimelineSeparator>
										<TimelineDot color="primary" variant="outlined" />
										<TimelineConnector />
									</TimelineSeparator>
									<TimelineContent>
										<Paper elevation={3} className={classes.paper}>
											<Typography>{key}</Typography>
										</Paper>
									</TimelineContent>
								</TimelineItem>
							))}
					</Timeline>
				</FuseScrollbars>
			</div>
			<Typography className="text-14 px-16 py-8 font-bold">도면</Typography>
			<div className="px-16 py-8">
				<Figures className="mx-16 my-8" appNo={props.search.출원번호원본} />
			</div>
		</Paper>
	);
}

export default HistoryTimeLine;
