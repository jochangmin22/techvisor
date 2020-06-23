import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
// // import searchData from './searchData';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	paper: {
		padding: theme.spacing(1),
		textAlign: 'center',
		backgroundColor: theme.palette.secondary.light,
		color: theme.palette.secondary.contrastText
	}
}));

function CompanyInfo(props) {
	const classes = useStyles();
	const { Item } = props.search;
	const { corpName, corpCode, stockCode } = props.companyCode;
	const companyInfo = useSelector(({ companyApp }) => companyApp.search.companyInfo);

	const corpInfo = {
		대표이사: companyInfo.ceo_nm,
		설립일자: companyInfo.est_dt,
		법인등록번호: companyInfo.jurir_no,
		// 기업형태: '주식회사 | 대기업', // companyInfo.korreprnm,
		// 산업분류: companyInfo.sanupcode,
		업종코드: companyInfo.induty_code,
		홈페이지: companyInfo.hm_url,
		전화번호: companyInfo.phn_no,
		'지번 주소': companyInfo.adres
		// 사업영역: companyInfo.sanup
	};

	const stockInfo = {
		시가총액: '362.97조', //companyInfo.korreprnm,
		'주가(월)': '44,080', // companyInfo.korreprnm,
		'거래량(주)': '4백만', //companyInfo.korreprnm,
		'주가 변동률(일/월/년)': '-1.01 | -6.47 | -11.14', // companyInfo.korreprnm,
		'PER(배)': companyInfo.PER,
		'PBR(배)': companyInfo.PBR,
		'ROE(%)': companyInfo.ROE
	};

	const financeInfo = {
		매출액: companyInfo.매출액 ? Number(companyInfo.매출액).toLocaleString() + '억원' : '',
		영업이익: companyInfo.영업이익 ? Number(companyInfo.영업이익).toLocaleString() + '억원' : '',
		당기순이익: companyInfo.당기순이익 ? Number(companyInfo.당기순이익).toLocaleString() + '억원' : '',
		자산: '339.36조', //companyInfo.korreprnm,
		부채: '91.6조', //companyInfo.korreprnm,
		자본: '347.76조', //companyInfo.korreprnm,
		'종업원수(월)': '102,981', //companyInfo.korreprnm,
		'': ''
	};
	// const corpInfo = {
	// 	대표이사: Item.korreprnm,
	// 	설립일자: Item.obz_date,
	// 	기업형태: '주식회사 | 대기업', // Item.korreprnm,
	// 	산업분류: Item.sanupcode,
	// 	홈페이지: 'http://www.samsung.com/sec', // Item.korreprnm,
	// 	전화번호: Item.tel,
	// 	'지번 주소': Item.koraddr,
	// 	사업영역: Item.sanup
	// };

	// const stockInfo = {
	// 	시가총액: '362.97조', //Item.korreprnm,
	// 	'주가(월)': '44,080', // Item.korreprnm,
	// 	'거래량(주)': '4백만', //Item.korreprnm,
	// 	'주가 변동률(일/월/년)': '-1.01 | -6.47 | -11.14', // Item.korreprnm,
	// 	PER: '8.89', //Item.korreprnm,
	// 	PBR: '1.26', //Item.korreprnm,
	// 	ROA: '1.08', //Item.korreprnm,
	// 	BOE: '23.77' //Item.korreprnm
	// };

	// const financeInfo = {
	// 	매출액: '343.77조', //Item.korreprnm,
	// 	영업이익: '58.69조', //Item.korreprnm,
	// 	당기순이익: '44.34조', //Item.korreprnm,
	// 	자산: '339.36조', //Item.korreprnm,
	// 	부채: '91.6조', //Item.korreprnm,
	// 	자본: '347.76조', //Item.korreprnm,
	// 	'종업원수(월)': '102,981', //Item.korreprnm,
	// 	'': ''
	// };

	if (!Item || Item.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="rounded-8 shadow m-8 mb-16 w-full p-16 items-center justify-center">
			<div className="flex flex-row items-center mb-4">
				<Typography variant="h6">{corpName}</Typography>
				{stockCode ? <Typography className="text-14 font-bold ml-8">KRX:{stockCode}</Typography> : ''}
				{corpCode ? <Typography className="text-14 font-bold ml-8">공시번호:{corpCode}</Typography> : ''}
			</div>

			<Grid container spacing={1}>
				<Grid item xs={12} sm={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>기업 개요</Paper>
					</Typography>
					{Object.entries(corpInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={4}>
								{key}
							</Grid>
							<Grid item xs={8}>
								{value}
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
								{key}
							</Grid>
							<Grid item xs={6} className="text-right">
								{value}
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
								{key}
							</Grid>
							<Grid item xs={8} className="text-right">
								{value}
							</Grid>
						</Grid>
					))}
				</Grid>
			</Grid>
		</Paper>
	);
}

export default CompanyInfo;
