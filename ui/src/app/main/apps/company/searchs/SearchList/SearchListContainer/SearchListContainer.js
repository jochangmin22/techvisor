// import Typography from '@material-ui/core/Typography';
// import Icon from '@material-ui/core/Icon';
// import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
// import { useTheme } from '@material-ui/core/styles';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import React, { useCallback } from 'react';
// import { useSelector } from 'react-redux';
import MainTable from '../MainTable';

function SearchListContainer(props) {
	const { status } = props;

	const WhatMsgToShow = useCallback(() => {
		if (status === 'noResults') {
			return (
				<Paper className="rounded-8 shadow h-224 w-full">
					<NoResultMsg />
				</Paper>
			);
		} else if (status === 'notStarted') {
			return (
				<Paper className="rounded-8 shadow h-auto w-full">
					<EmptyMsg icon="chat" msg="검색결과" />
				</Paper>
			);
		} else {
			return (
				<Paper className="rounded-8 shadow h-full w-full">
					<MainTable />
				</Paper>
			);
		}
	}, [status]);

	return (
		<div className="flex flex-col w-full h-full md:pt-0">
			{WhatMsgToShow()}
			{/* {notSelectedYet && <WaitMsg />} */}
		</div>
	);
}

export default SearchListContainer;
