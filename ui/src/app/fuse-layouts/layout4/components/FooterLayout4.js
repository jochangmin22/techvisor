import AppBar from '@material-ui/core/AppBar';
import { ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectFooterTheme } from 'app/store/fuse/settingsSlice';
import { makeStyles } from '@material-ui/core/styles';
import { RiFacebookCircleLine, RiTwitterLine, RiGoogleLine, RiKakaoTalkLine } from 'react-icons/ri';

const useStyles = makeStyles(theme => ({
	logoIcon: {
		width: 100, // 24,
		height: 32, // 24,

		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

function FooterLayout4(props) {
	const classes = useStyles();
	const footerTheme = useSelector(selectFooterTheme);

	return (
		<ThemeProvider theme={footerTheme}>
			<AppBar
				id="fuse-footer"
				className="relative z-10"
				color="default"
				style={{ backgroundColor: footerTheme.palette.background.paper }}
				elevation={2}
			>
				<Toolbar className="min-h-48 md:min-h-64 px-8 sm:px-12 py-0 flex flex-col w-full items-center overflow-x-auto">
					<Container className="flex flex-row flex-wrap pt-64 pb-32 w-full -mx-32 mb-8">
						<div className="flex flex-col w-full sm:w-1/2 md:w-1/4 mb-16 md:mb-5">
							<Typography color="textSecondary" variant="h6" className="mb-4">
								Btowin Partners
							</Typography>
							<ul className="leading-loose">
								<li>
									<a role="button" href="#none" target="_blank" rel="noreferrer noopener">
										회사소개
									</a>
								</li>
							</ul>
						</div>
						<div className="flex flex-col w-full sm:w-1/2 md:w-1/4 mb-16 md:mb-5">
							<Typography color="textSecondary" variant="h6" className="mb-4">
								서비스
							</Typography>
							<ul className="leading-loose">
								<li>
									<a
										role="button"
										href="https://www.notion.so/462f98867d2b479f9ccc31142d0129bb"
										target="_blank"
										rel="noreferrer noopener"
									>
										이용요금
									</a>
								</li>

								<li>
									<a
										role="button"
										href="https://www.notion.so/060138803fe046d4a4d4eaab641ca06a"
										target="_blank"
										rel="noreferrer noopener"
									>
										서비스소개
									</a>
								</li>
							</ul>
						</div>
						<div className="flex flex-col w-full sm:w-1/2 md:w-1/4 mb-16 md:mb-5">
							<Typography color="textSecondary" variant="h6" className="mb-4">
								고객지원
							</Typography>
							<ul className="leading-loose">
								<li>
									<a role="button" href="#none" target="_blank" rel="noreferrer noopener">
										고객센터
									</a>
								</li>
								<li>
									<a role="button" href="#none" target="_blank" rel="noreferrer noopener">
										공지사항
									</a>
								</li>
							</ul>
						</div>
						<div className="flex flex-col w-full sm:w-1/2 md:w-1/4 mb-5 object-left">
							<Link className="justify-left cursor-pointer mb-8" to="/landing" role="button">
								<img
									className={classes.logoIcon}
									src="assets/images/logos/logo_ipgrim_shadow.svg"
									alt="logo"
								/>
							</Link>
							<Typography color="textSecondary" noWrap className="mb-16 leading-loose">
								(주)비투윈파트너스
								<br />
								대표 : 김주연
								<br />
								사업자등록번호: 105-87-69848
								<br />
								통신판매업신고번호 제 2019-서울서초-1036호
								<br />
								서울특별시 서초구 서초대로 53길 10, 서일빌딩 6층
								<br />
								대표번호: 02-2088-8219
								<br />
								고객문의: btowin@btowin.co.kr
							</Typography>

							<ul className="flex flex-row">
								<li className="mr-4">
									<a href="#none" target="_blank" rel="noreferrer noopener">
										<RiFacebookCircleLine size="24" />
									</a>
								</li>

								<li className="mr-4">
									<a href="#none" target="_blank" rel="noreferrer noopener">
										<RiTwitterLine size="24" />
									</a>
								</li>

								<li className="mr-4">
									<a href="#none" target="_blank" rel="noreferrer noopener">
										<RiGoogleLine size="24" />
									</a>
								</li>

								<li>
									<a href="#none" target="_blank" rel="noreferrer noopener">
										<RiKakaoTalkLine size="24" />
									</a>
								</li>
							</ul>
						</div>
					</Container>
					<Container className="flex w-full border-t border-gray-400 border-opacity-25 p-32">
						{/* <div className="flex m-auto p-12"> */}
						<div className="flex flex-row w-full justify-center">
							<p className="font-light text-gray-200 mr-16 text-12">
								Copyright ⓒ <strong>Btowin Partners</strong>, all rights reserved.
							</p>
							<Link className="font-medium text-14 mr-16 cursor-pointer" to="/policy/terms" role="button">
								서비스 정책
							</Link>
						</div>
					</Container>
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default React.memo(FooterLayout4);
