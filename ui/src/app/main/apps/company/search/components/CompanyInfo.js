import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import searchData from './searchData';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

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

	const corpInfo = {
		대표이사: Item.korreprnm,
		설립일자: Item.obz_date,
		기업형태: '주식회사 | 대기업', // Item.korreprnm,
		산업분류: Item.sanupcode,
		홈페이지: 'http://www.samsung.com/sec', // Item.korreprnm,
		전화번호: Item.tel,
		'지번 주소': Item.koraddr,
		사업영역: Item.sanup
	};

	const stockInfo = {
		시가총액: '362.97조', //Item.korreprnm,
		'주가(월)': '44,080', // Item.korreprnm,
		'거래량(주)': '4백만', //Item.korreprnm,
		'주가 변동률(일/월/년)': '-1.01 | -6.47 | -11.14', // Item.korreprnm,
		PER: '8.89', //Item.korreprnm,
		PBR: '1.26', //Item.korreprnm,
		ROA: '1.08', //Item.korreprnm,
		BOE: '23.77' //Item.korreprnm
	};

	const financeInfo = {
		매출액: '343.77조', //Item.korreprnm,
		영업이익: '58.69조', //Item.korreprnm,
		당기순이익: '44.34조', //Item.korreprnm,
		자산: '339.36조', //Item.korreprnm,
		부채: '91.6조', //Item.korreprnm,
		자본: '347.76조', //Item.korreprnm,
		'종업원수(월)': '102,981', //Item.korreprnm,
		'': ''
	};

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
				<Grid item xs={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>기업 개요</Paper>
					</Typography>
					{Object.entries(corpInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={5}>
								{key}
							</Grid>
							<Grid item xs={7}>
								{value}
							</Grid>
						</Grid>
					))}
				</Grid>
				<Grid item xs={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>시황 정보</Paper>
					</Typography>
					{Object.entries(stockInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={5}>
								{key}
							</Grid>
							<Grid item xs={6} className='text-right'>
								{value}
							</Grid>
						</Grid>
					))}
				</Grid>
				<Grid item xs={4}>
					<Typography gutterBottom variant="subtitle1">
						<Paper className={classes.paper}>재무 정보</Paper>
					</Typography>
					{Object.entries(financeInfo).map(([key, value]) => (
						<Grid container key={key} spacing={3}>
							<Grid item xs={5}>
								{key}
							</Grid>
							<Grid item xs={6} className='text-right'>
								{value}
							</Grid>
						</Grid>
					))}
				</Grid>
			</Grid>

			{/* <EnhancedTable columns={columns} data={data} size="small" height="max-h-160" /> */}
			{/* <p>
				산업: {Item.sanupcode} | 설립일: {Item.obz_date}
			</p>
			<p>{Item.koraddr}</p>
			<p>
				(Tel) {Item.tel} | (Fax) {Item.tel}
			</p>
			<p>
				매출 {Item.tel} | 영업이익 {Item.tel} | 당기순이익 {Item.tel}
			</p>
			<p>
				자산 {Item.tel} | 부채 {Item.tel} | 자본 {Item.tel}
			</p>
			<p>
				Leverage {Item.tel} | 영업이익률 {Item.tel} | ROA {Item.tel}
			</p>
			<p>
				시가총액 {Item.tel} | PER {Item.tel} | PBR {Item.tel}
			</p>
			<p>종업원수 {Item.tel}</p>
			<p>사업 영역: {Item.tel}</p> */}
		</Paper>
	);
}

export default CompanyInfo;
