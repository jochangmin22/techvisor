import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import searchData from './searchData';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		height: '68px',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1),
		textAlign: 'center',
		backgroundColor: theme.palette.secondary.light,
		color: theme.palette.secondary.contrastText
	}
}));

function CompanyInfo(props) {
	const { Item } = props.search;
	const classes = useStyles();
	const theme = useTheme();

	const corpInfo = {
		대표이사: Item.korreprnm,
		설립일자: Item.obz_date,
		기업형태: Item.korreprnm,
		산업분류: Item.sanupcode,
		홈페이지: Item.korreprnm,
		전화번호: Item.tel,
		'지번 주소': Item.koraddr,
		사업영역: Item.sanup
	};

	const stockInfo = {
		시가총액: Item.korreprnm,
		'주가(월)': Item.korreprnm,
		'거래량(주)': Item.korreprnm,
		'주가 변동률(일/월/년)': Item.korreprnm,
		PER: Item.korreprnm,
		PBR: Item.korreprnm,
		ROA: Item.korreprnm,
		BOE: Item.korreprnm
	};

	const financeInfo = {
		매출액: Item.korreprnm,
		영업이익: Item.korreprnm,
		당기순이익: Item.korreprnm,
		자산: Item.korreprnm,
		부채: Item.korreprnm,
		자본: Item.korreprnm,
		'종업원수(월)': Item.korreprnm,
		'': ''
	};

	if (!Item || Item.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="rounded-8 shadow m-8 mb-16 w-full p-16 items-center justify-center">
			<Typography variant="h6">삼성전자</Typography>
			<Typography className="text-14 font-bold">KRX:{Item.stockcode}</Typography>

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
							<Grid item xs={7}>
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
							<Grid item xs={7}>
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
