import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector, useDispatch } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import * as Actions from './store/actions';
import reducer from '../search/store/reducers';
import RawDataRatio from './header/RawDataRatio';
import HeaderGrid from './header/HeaderGrid';

const useStyles = makeStyles(theme => ({
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function ClassifyHeader(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const mainTheme = useSelector(({ fuse }) => fuse.settings.mainTheme);
	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);

	useEffect(() => {
		if (searchs) {
			dispatch(Actions.setClassify(searchs));
		}
	}, [searchs, dispatch]);
	const [data, setData] = useState([]);
	// const [data, setData] = useState([
	//     {
	//         등록사항: "공개",
	//         "발명의명칭(국문)": "바퀴동력제어기와 방향변환기를 장착한 소형차",
	//         출원번호: "1020130083279",
	//         출원일자: "20130716",
	//         ipc요약: "B62D"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)":
	//             "전동자전거용 배터리팩에 대한 배터리관리시스템 하이브리드 리셋 제어 장치 및 방법",
	//         출원번호: "1020130151507",
	//         출원일자: "20131206",
	//         ipc요약: "B60L"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020130152784",
	//         출원일자: "20131210",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "공개",
	//         "발명의명칭(국문)":
	//             "금속과 비금속 나노물질을 이용한 고효율의 제너레이터가 장착된 스쿠터",
	//         출원번호: "1020140100462",
	//         출원일자: "20140805",
	//         ipc요약: "B62J"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "태양광 구동 하이브리드 쓰레기통",
	//         출원번호: "1020140168944",
	//         출원일자: "20141128",
	//         ipc요약: "B65F"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "차세대 친환경 자동차용 2차 전지 제어장치",
	//         출원번호: "1020150019577",
	//         출원일자: "20150209",
	//         ipc요약: "B60L"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "하이브리드 전기자전거",
	//         출원번호: "1020160057980",
	//         출원일자: "20160512",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "공개",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020170088949",
	//         출원일자: "20170711",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)":
	//             "장거리 여행을 위한 자전거용 하이브리드 자주식 카트",
	//         출원번호: "1020180013022",
	//         출원일자: "20180201",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)":
	//             "전기차 과전압 방지 기능을 갖는 비접촉 수전장치, 충전 시스템 및 그 제어 방법",
	//         출원번호: "1020180059283",
	//         출원일자: "20180524",
	//         ipc요약: "B60L"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "전기차용 비접촉 급전장치",
	//         출원번호: "1020180065990",
	//         출원일자: "20180608",
	//         ipc요약: "B60L"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)":
	//             "자가발전기, 연료전지, 태양전지를 이용한 자전거용 전원공급 장치",
	//         출원번호: "1020060134668",
	//         출원일자: "20061222",
	//         ipc요약: "B62J"
	//     },
	//     {
	//         등록사항: "취하",
	//         "발명의명칭(국문)":
	//             "네 바퀴에 각각 독립적인 완충기능을 갖춘 이륜구동운송수단",
	//         출원번호: "1020070040002",
	//         출원일자: "20070424",
	//         ipc요약: "B62K"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "하이브리드 프리휠 장치",
	//         출원번호: "1020070076368",
	//         출원일자: "20070730",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "보행자 및 자전거 전용 도로용 탄성바닥재",
	//         출원번호: "1020070114200",
	//         출원일자: "20071109",
	//         ipc요약: "E01C"
	//     },
	//     {
	//         등록사항: "포기",
	//         "발명의명칭(국문)": "가스 엔진 구동 하이브리드 자전거",
	//         출원번호: "1020080129031",
	//         출원일자: "20081218",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "축전지팩의 제어 관리 장치 및 그 방법",
	//         출원번호: "1020090005269",
	//         출원일자: "20090121",
	//         ipc요약: "G01R"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)":
	//             "수동과 자동 기능을 갖는 하이브리드 동력전달장치",
	//         출원번호: "1020090020370",
	//         출원일자: "20090310",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020090050282",
	//         출원일자: "20090608",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020090050289",
	//         출원일자: "20090608",
	//         ipc요약: "B62K"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거의 제어방법",
	//         출원번호: "1020090050286",
	//         출원일자: "20090608",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거 및 그의 고장표시방법",
	//         출원번호: "1020090050283",
	//         출원일자: "20090608",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "무체인자전거",
	//         출원번호: "1020090069742",
	//         출원일자: "20090728",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "엔진음/배기음 발생장치 및 방법과 기록매체",
	//         출원번호: "1020090078983",
	//         출원일자: "20090825",
	//         ipc요약: "B60Q"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)":
	//             "전원 공급 장치 및 그 방법, 전원 공급 시스템 및 이를 이용한 전원 공급 서비스 방법",
	//         출원번호: "1020090126744",
	//         출원일자: "20091218",
	//         ipc요약: "B60L"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "하이브리드 전원공급장치",
	//         출원번호: "1020100008919",
	//         출원일자: "20100201",
	//         ipc요약: "H02J"
	//     },
	//     {
	//         등록사항: "취하",
	//         "발명의명칭(국문)": "승용차형 4륜 자전거",
	//         출원번호: "1020100042877",
	//         출원일자: "20100507",
	//         ipc요약: "B62K"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)":
	//             "전동보조 자전거용 하이브리드 SR모터의 제어장치",
	//         출원번호: "1020100060548",
	//         출원일자: "20100625",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거의 동력 보조 시스템",
	//         출원번호: "1020100070567",
	//         출원일자: "20100721",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)":
	//             "하이브리드 타입 자전거 렌트 방법, 및 그 시스템",
	//         출원번호: "1020100075617",
	//         출원일자: "20100805",
	//         ipc요약: "G06Q"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020100081719",
	//         출원일자: "20100820",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "레저용 하이브리드 자전거",
	//         출원번호: "1020110028569",
	//         출원일자: "20110330",
	//         ipc요약: "B62K"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "회생형 자전거",
	//         출원번호: "1020120085909",
	//         출원일자: "20120806",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "거절",
	//         "발명의명칭(국문)": "하이브리드 구동형 수륙양용 운송 장치",
	//         출원번호: "1020120111942",
	//         출원일자: "20121009",
	//         ipc요약: "B60F"
	//     },
	//     {
	//         등록사항: "소멸",
	//         "발명의명칭(국문)": "하이브리드 자전거",
	//         출원번호: "1020090105327",
	//         출원일자: "20091103",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "하이브리드 프리휠 장치",
	//         출원번호: "1020040057392",
	//         출원일자: "20040722",
	//         ipc요약: "B62M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "2차 전지용 양극 활물질 및 그 제조 방법",
	//         출원번호: "1020047002564",
	//         출원일자: "20020816",
	//         ipc요약: "H01M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)":
	//             "신규한 구조의 이차전지 및 이를 포함하는 전지팩",
	//         출원번호: "1020050047765",
	//         출원일자: "20050603",
	//         ipc요약: "H01M"
	//     },
	//     {
	//         등록사항: "등록",
	//         "발명의명칭(국문)": "이차전지 및 이를 포함하는 전지모듈",
	//         출원번호: "1020050081479",
	//         출원일자: "20050902",
	//         ipc요약: "H01M"
	//     }
	// ]);

	// useEffect(() => {
	//     if (data) {
	//         dispatch(Actions.setClassify(data));
	//     }
	// }, [data, dispatch]);

	const [anchorEl, setAnchorEl] = React.useState(null);

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
							<Icon className="text-32 mr-0 sm:mr-12">import_contacts</Icon>
						</FuseAnimate>
						<FuseAnimate animation="transition.slideLeftIn" delay={300}>
							<Typography className="hidden sm:flex" variant="h6">
								특허 분류
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
							// disabled={searchs.length === 0}
							onClick={ev => {
								ev.stopPropagation();
								if (searchs.length !== 0) {
									setData(searchs);
								}
							}}
						>
							검색결과 불러오기
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
						<RawDataRatio data={data} />
						<HeaderGrid data={data} />
					</div>
				</ThemeProvider>
			) : (
				<FuseAnimate animation="transition.slideDownIn" delay={300}>
					<div className="flex flex-col flex-1 items-center justify-center px-12">
						<Typography variant="h6" className="mt-36">
							분류 데이터 없음
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

export default withReducer('searchApp', reducer)(ClassifyHeader);
