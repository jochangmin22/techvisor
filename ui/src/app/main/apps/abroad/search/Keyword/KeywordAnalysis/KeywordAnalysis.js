import React from 'react';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function KeywordAnalysis(props) {
	const classes = useStyles(props);
	const { keywordInfo } = props;

	return (
		<>
			{Object.entries(keywordInfo).map(([key, value]) => (
				<Grid container key={key} spacing={3}>
					<Grid item xs={6}>
						<div className={clsx(classes.primaryColor, 'p-4 md:p-8')}>{key} 단어 수</div>
					</Grid>
					<Grid item xs={6}>
						<div className="p-4 md:p-8 text-base">{value}</div>
					</Grid>
				</Grid>
			))}
		</>
	);
}

export default KeywordAnalysis;
