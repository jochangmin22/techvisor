import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { useTheme } from '@material-ui/core/styles';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import MainTable from '../MainTable';

function SearchListContainer() {
	const theme = useTheme();
	const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);
	const [open, setOpen] = useState(false);

	const ReturnListMsg = () => {
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

	const WaitMsg = () => {
		return (
			<div className="flex h-full items-center justify-center px-24">
				<EmptyMsg icon="mouse" msg="기업을 선택하세요" text="목록에서 기업을 클릭하세요!.." />
			</div>
		);
	};

	const isEmpty = Object.values(selectedCode).every(x => x === null || x === '');
	const notSelectedYet = !!(!searchLoading && isEmpty);

	return (
		<div className="flex flex-col w-full h-auto md:pt-0">
			{open ? <ReturnListMsg /> : <MainTable onShrink={() => setOpen(true)} />}
			{notSelectedYet && <WaitMsg />}
		</div>
	);
}

export default SearchListContainer;
