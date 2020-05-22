import React, { useState, useEffect } from 'react';
import {
	Button,
	Hidden,
	Icon,
	IconButton,
	// Input,
	// Link,
	Popover,
	Typography
} from '@material-ui/core';

import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import * as Actions from './store/actions';
import reducer from '../search/store/reducers';
import HeaderGrid from './header/HeaderGrid';

const useStyles = makeStyles(theme => ({
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function SummaryHeader(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const mainTheme = useSelector(({ fuse }) => fuse.settings.mainTheme);
	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);
	useEffect(() => {
		if (searchs) {
			dispatch(Actions.setSummary(searchs));
		}
	}, [searchs, dispatch]);
	const [data, setData] = useState([]);

	const [anchorEl, setAnchorEl] = useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div className="flex flex-1 flex-col p-12 justify-between z-10 container">
			<div className="flex flex-row items-center justify-between">
				<div className="flex flex-shrink items-center sm:w-224">
					<Hidden lgUp>
						<IconButton
							onClick={ev => {
								props.pageLayout.current.toggleLeftSidebar();
							}}
							aria-label="open left sidebar"
						>
							<Icon>menu</Icon>
						</IconButton>
					</Hidden>

					<div className="flex items-center">
						<FuseAnimate animation="transition.expandIn" delay={300}>
							<Icon className="text-32 mr-0 sm:mr-12">receipt</Icon>
						</FuseAnimate>
						<FuseAnimate animation="transition.slideLeftIn" delay={300}>
							<Typography className="hidden sm:flex" variant="h6">
								특허 요지맵
							</Typography>
						</FuseAnimate>
					</div>
				</div>

				<div className="flex flex-1 items-center justify-center md:pr-192">
					{/* <ThemeProvider theme={mainTheme}> */}
					<div className="flex items-center justify-end">
						<Button
							aria-owns={open && searchs.length === 0 ? 'mouse-over-popover' : undefined}
							aria-haspopup="true"
							onMouseEnter={handlePopoverOpen}
							onMouseLeave={handlePopoverClose}
							className="mr-8 normal-case"
							variant="contained"
							color="secondary"
							aria-label="Follow"
							// disabled={!searchText}
							onClick={ev => {
								ev.stopPropagation();
								if (searchs.length !== 0) {
									setData(searchs);
								}
							}}
						>
							검색결과 가져오기
						</Button>
						<Popover
							id="mouse-over-popover"
							className={classes.popover}
							classes={{
								paper: classes.paper
							}}
							open={open}
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center'
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left'
							}}
							// anchorOrigin={{
							//     vertical: "center",
							//     horizontal: "left"
							// }}
							// transformOrigin={{
							//     vertical: "center",
							//     horizontal: "right"
							// }}
							onClose={handlePopoverClose}
							disableRestoreFocus
						>
							<Typography>검색결과를 불러오시려면 먼저 [기본검색] 에서 검색어를 입력하세요!..</Typography>
						</Popover>
						<Button className="normal-case" variant="contained" color="primary" aria-label="Send Message">
							마이폴더 불러오기
						</Button>
					</div>
					{/* </ThemeProvider> */}
				</div>
			</div>
			{data.length !== 0 ? (
				<ThemeProvider theme={mainTheme}>
					<div className="w-lg mx-auto">
						{/* <RawDataRatio data={data} /> */}
						<HeaderGrid data={data} />
					</div>
				</ThemeProvider>
			) : (
				<FuseAnimate animation="transition.slideDownIn" delay={300}>
					<div className="flex flex-col flex-1 items-center justify-center px-12">
						<Typography variant="h6" className="mt-36">
							요지맵 데이터 없음
						</Typography>
						<Typography className="hidden md:flex px-16 pb-24 mt-36 text-center" color="textSecondary">
							불러오기 버튼을 누르세요
							{/* [검색결과 불러오기] 나 [마이폴더 불러오기]를 눌러서 분류 테이터를 불러오세요. */}
							{/* 검색결과를 가져오시려면
                            먼저 [기본검색] 에서 검색어를 입력하세요!.. */}
						</Typography>
					</div>
				</FuseAnimate>
			)}
		</div>
	);
}
export default withReducer('searchApp', reducer)(SummaryHeader);
