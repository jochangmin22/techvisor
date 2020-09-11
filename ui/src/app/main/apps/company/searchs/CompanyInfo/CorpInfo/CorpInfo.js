import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { addSeparator } from 'app/main/apps/lib/utils';

const useStyles = makeStyles(theme => ({
	paper: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1.5),
		textAlign: 'center',
		backgroundColor: theme.palette.secondary.light,
		color: theme.palette.secondary.contrastText
	}
}));

function CompanyInfoContainer(props) {
	const classes = useStyles();
	const item = props.companyInfo;

	const corpInfo = {
		대표이사: item.ceo_nm,
		설립일: item.est_dt ? addSeparator(item.est_dt, '.', 4, 6) : '',
		상장일: item.상장일 ? item.상장일 : '',
		// 법인등록번호: item.jurir_no,
		// 기업형태: '주식회사 | 대기업', // item.korreprnm,
		// 산업분류: item.sanupcode,
		// 업종코드: item.induty_code,
		업종: item.업종,
		주요제품: item.주요제품,
		홈페이지: item.hm_url,
		전화번호: item.phn_no,
		'지번 주소': item.adres
		// 사업영역: item.sanup
	};

	const stockInfo = {
		시가총액: item.시가총액,
		'주가(월)': '', // item.korreprnm,
		'거래량(주)': item.거래량,
		'주가 수익률(일/월/년)': item.수익률,
		'PER(배)': item['PER(배)'],
		'PBR(배)': item['PBR(배)'],
		'ROE(%)': item['ROE(%)'],
		'EPS(원)': item['EPS(원)'] ? item['EPS(원)'] + '원' : ''
	};

	const financeInfo = {
		매출액: item.매출액 ? item.매출액 + '억원' : '',
		영업이익: item.영업이익 ? item.영업이익 + '억원' : '',
		당기순이익: item.당기순이익 ? item.당기순이익 + '억원' : '',
		자산: item.자산총계 ? item.자산총계 + '억원' : '',
		부채: item.부채총계 ? item.부채총계 + '억원' : '',
		자본: item.자본총계 ? item.자본총계 + '억원' : '',
		'종업원수(월)': item.종업원수 ? item.종업원수 + '명' : '',
		'': ''
	};

	return (
		<Paper className="rounded-8 shadow mb-16 w-full p-16 items-center justify-center">
			<div className="flex flex-row items-center mb-4">
				<Typography variant="h6">{item.corp_name}</Typography>
				{item.stock_code ? (
					<Typography className="text-14 font-bold ml-8">KRX:{item.stock_code}</Typography>
				) : (
					''
				)}
				{item.corp_code ? (
					<Typography className="text-14 font-bold ml-8">공시번호:{item.corp_code}</Typography>
				) : (
					''
				)}
			</div>

			{!item || item.length === 0 ? (
				<SpinLoading />
			) : (
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
			)}
		</Paper>
	);
}

export default CompanyInfoContainer;
