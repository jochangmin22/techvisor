import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { useTheme } from '@material-ui/core/styles';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MainTable from '../MainTable';

function SearchListContainer(props) {
	const { status } = props;
	const theme = useTheme();
	// const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(false);
	}, [searchLoading]);

	const HideTableShowMsg = () => {
		return (
			<div className="flex justify-start items-center">
				<Typography
					className="normal-case flex items-center"
					role="button"
					onClick={() => setOpen(false)}
					color="inherit"
				>
					<IconButton>
						<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}</Icon>
					</IconButton>
					목록으로 돌아가기
				</Typography>
			</div>
		);
	};

	// const WaitMsg = () => {
	// 	return (
	// 		<div className="flex h-full items-center justify-center px-24">
	// 			<EmptyMsg icon="mouse" msg="기업을 선택하세요" text="목록에서 기업을 클릭하세요!.." />
	// 		</div>
	// 	);
	// };

	const WhatMsgToShow = useCallback(() => {
		if (open) {
			return <HideTableShowMsg />;
		} else if (status === 'noResults') {
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
				<Paper className="rounded-8 shadow h-512 w-full">
					<MainTable onShrink={() => setOpen(true)} />
				</Paper>
			);
		}
	}, [open, status]);

	// const isEmpty = Object.values(selectedCode).every(x => x === null || x === '');
	// const notSelectedYet = !!(!searchLoading && isEmpty);

	return (
		<div className="flex flex-col w-full h-auto md:pt-0">
			{WhatMsgToShow()}
			{/* {notSelectedYet && <WaitMsg />} */}
		</div>
	);
}

export default SearchListContainer;
