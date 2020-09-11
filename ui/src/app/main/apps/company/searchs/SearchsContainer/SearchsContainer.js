import React from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { useTheme } from '@material-ui/core/styles';
import ContentTable from '../ContentTable';
import CompanyInfoContainer from '../CompanyInfo/CompanyInfoContainer';
import { Link } from 'react-router-dom';

function SearchsContainer() {
	const theme = useTheme();
	return (
		<>
			<div className="flex justify-start items-center">
				<FuseAnimate animation="transition.slideRightIn" delay={300}>
					<Typography
						className="normal-case flex items-center"
						component={Link}
						role="button"
						to="/apps/companies"
						color="inherit"
					>
						<IconButton>
							<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}</Icon>
						</IconButton>
						목록으로 돌아가기
					</Typography>
				</FuseAnimate>
			</div>
			<div className="flex w-full h-full p-16 md:pt-0">
				<CompanyInfoContainer />
			</div>
			<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
				<div>특허통계분석</div>
			</div>
			<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
				<div>매트릭스분석 </div>
			</div>
			<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
				<div>뉴스분석</div>
			</div>
			<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
				<div>임상정보</div>
			</div>
			<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
				<div>임상정보</div>
			</div>
			<div className="flex w-full h-full p-16 md:pt-0">
				<ContentTable />
			</div>
		</>
	);
}

export default SearchsContainer;
