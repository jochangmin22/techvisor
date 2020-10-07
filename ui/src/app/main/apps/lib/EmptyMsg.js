import React from 'react';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

function EmptyMsg(props) {
	return (
		<div className="flex flex-col flex-1 h-full items-center justify-center p-24">
			<Paper className="rounded-full p-48">
				<Icon className="block text-64" color="secondary">
					{props.icon}
				</Icon>
			</Paper>
			<Typography variant="h6" className="my-24">
				{props.msg}
			</Typography>
			<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
				{props.text ? props.text : '시작하시려면 먼저 검색어를 입력하세요!..'}
			</Typography>
		</div>
	);
}

export default EmptyMsg;
