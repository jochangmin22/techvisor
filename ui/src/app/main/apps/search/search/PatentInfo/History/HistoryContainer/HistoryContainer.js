import React from 'react';
import Paper from '@material-ui/core/Paper';
import ApplicationHistory from '../ApplicationHistory';
import Typography from '@material-ui/core/Typography';
import Figures from '../Figures';

function HistoryContainer() {
	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12 py-0">
				<Typography className="p-12 text-14 font-bold">출원 히스토리</Typography>
				<ApplicationHistory />
			</div>
			<Typography className="text-14 px-16 py-8 font-bold">도면</Typography>
			<div className="px-16 py-8">
				<Figures className="mx-16 my-8" />
			</div>
		</Paper>
	);
}

export default HistoryContainer;
