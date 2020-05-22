import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { DemoContent } from '@fuse';

import SurveyAnnounce from './SurveyAnnounce';

const useStyles = makeStyles({
	root: {
		padding: 24
	}
});

function SurveyApp() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<SurveyAnnounce />
			<DemoContent />
		</div>
	);
}

export default SurveyApp;
