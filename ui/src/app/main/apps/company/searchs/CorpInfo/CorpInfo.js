import React, { useEffect, useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { addSeparator, numberToKorean } from 'app/main/apps/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyInfo } from 'app/main/apps/company/store/searchsSlice';

const useStyles = makeStyles(theme => ({
	paper: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1.5),
		textAlign: 'center',
		backgroundColor: theme.palette.secondary.light,
		color: theme.palette.secondary.contrastText
	}
}));

function CorpInfo() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const arr = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);
	const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);

	useEffect(() => {
		const isEmpty = Object.values(selectedCode).every(x => x === null || x === '');
		if (!isEmpty) {
			dispatch(getCompanyInfo(selectedCode));
		}
	}, [selectedCode]);

	const corpInfo = useMemo(
		() =>
			arr
				? {
						대표자: arr.대표자,
						개업일자: arr.개업일자 ? addSeparator(arr.개업일자, '.', 4, 6) : '',
						상장일: arr.상장일 ? arr.상장일 : '',
						// 법인등록번호: arr.jurir_no,
						기업규모: arr.기업규모,
						// 산업분류: arr.sanupcode,
						업종코드: arr.업종코드,
						업종: arr.업종,
						주요제품: arr.주요제품,
						홈페이지: arr.홈페이지URL,
						전화번호: arr.전화번호,
						'지번 주소': arr.주소
						// 사업영역: arr.sanup
				  }
				: {},
		[arr]
	);
	const stockInfo = useMemo(
		() =>
			arr
				? {
						시가총액: arr.시가총액,
						'주가(월)': '', // arr.korreprnm,
						'거래량(주)': arr.거래량,
						'주가 수익률(일/월/년)': arr.수익률,
						'PER(배)': arr['PER(배)'],
						'PBR(배)': arr['PBR(배)'],
						'ROE(%)': arr['ROE(%)'],
						'EPS(원)': arr['EPS(원)'] ? arr['EPS(원)'] + '원' : ''
				  }
				: {},
		[arr]
	);
	const financeInfo = useMemo(
		() =>
			arr
				? {
						매출액: numberToKorean(arr.매출액),
						영업이익: numberToKorean(arr.영업이익),
						당기순이익: numberToKorean(arr.당기순이익),
						자산: numberToKorean(arr.자산총계),
						부채: numberToKorean(arr.부채총계),
						자본: numberToKorean(arr.자본총계),
						'종업원수(월)': Number(arr.종업원수).toLocaleString(),
						'': ''
				  }
				: {},
		[arr]
	);

	if (!arr || arr.length === 0) {
		return '';
	}

	return (
		<Paper className="w-full h-full rounded-8 p-8">
			<div className="flex flex-row items-center mb-4">
				<Typography variant="h6">{arr.corp_name}</Typography>
				{arr.주식코드 ? (
					<Typography className="text-14 font-bold ml-8">종목코드:{arr.주식코드}</Typography>
				) : (
					''
				)}
				{arr.사업자등록번호 ? (
					<Typography className="text-14 font-bold ml-8">사업자등록번호:{arr.사업자등록번호}</Typography>
				) : (
					''
				)}
			</div>

			<Grid container spacing={3}>
				<Grid item xs={12} sm={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>기업 개요</Paper>
					</Typography>
					{Object.entries(corpInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={4}>
								<Typography variant="body2" color="textSecondary" className="pl-16">
									{key}
								</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography variant="body2" gutterBottom>
									{value}
								</Typography>
							</Grid>
						</Grid>
					))}
				</Grid>
				<Grid item xs={12} sm={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>시황 정보</Paper>
					</Typography>
					{Object.entries(stockInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={6}>
								<Typography variant="body2" color="textSecondary" className="pl-16">
									{key}
								</Typography>
							</Grid>
							<Grid item xs={6} className="text-right">
								<Typography variant="body2" gutterBottom>
									{value}
								</Typography>
							</Grid>
						</Grid>
					))}
				</Grid>
				<Grid item xs={12} sm={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>재무 정보</Paper>
					</Typography>
					{Object.entries(financeInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={4}>
								<Typography variant="body2" color="textSecondary" className="pl-16">
									{key}
								</Typography>
							</Grid>
							<Grid item xs={8} className="text-right">
								<Typography variant="body2" gutterBottom>
									{value}
								</Typography>
							</Grid>
						</Grid>
					))}
				</Grid>
			</Grid>
		</Paper>
	);
}

export default CorpInfo;
