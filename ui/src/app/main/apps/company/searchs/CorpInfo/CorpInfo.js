import React, { useEffect, useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyInfo } from 'app/main/apps/company/store/searchsSlice';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import { numberToWon } from 'app/main/apps/lib/utils';

function CorpInfo() {
	const dispatch = useDispatch();
	const arr = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);
	const selectedCorp = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp);

	useEffect(() => {
		const isEmpty = Object.values(selectedCorp).every(x => x === null || x === '');
		if (!isEmpty) {
			dispatch(getCompanyInfo(selectedCorp));
		}
		// eslint-disable-next-line
	}, [selectedCorp]);

	const corpInfo = useMemo(
		() =>
			arr
				? {
						대표자명: arr.대표자명,
						// 개업일자: addSeparator(arr.개업일자, '.', 4, 6),
						상장일: arr.상장일 ? arr.상장일 : '',
						법인등록번호: arr.법인등록번호,
						// 기업규모: arr.기업규모,
						// 산업분류: arr.sanupcode,
						// 업종코드: arr.업종코드,
						업종: arr.업종,
						주요제품: arr.주요제품,
						홈페이지: arr.홈페이지,
						전화번호: arr.전화번호,
						주소: arr.주소
						// 사업영역: arr.sanup
				  }
				: {},
		[arr]
	);
	const financeInfo = useMemo(
		() =>
			arr
				? {
						매출액: numberToWon(arr.매출액),
						영업이익: numberToWon(arr.영업이익),
						당기순이익: numberToWon(arr.당기순이익),
						자산: numberToWon(arr.자산총계),
						부채: numberToWon(arr.부채총계),
						자본: numberToWon(arr.자본총계),
						'종업원수(월)': arr.종업원수 ? arr.종업원수 + '명' : ''
				  }
				: {},
		[arr]
	);

	if (!arr || arr.length === 0) return '';

	return (
		<div className="md:flex w-full">
			<Card className="w-full rounded-8">
				{/* <AppBar position="static" elevation={0}>
					<Toolbar className="px-8">
						<div className="flex flex-row justify-between">
							<Typography variant="subtitle1" color="inherit" className="px-12" edge="start">
								기업 개요
							</Typography>
							<div className="flex flex-row items-center">
								<Typography className="font-medium text-gray-400" color="inherit">
									{arr.회사명}
								</Typography>
								<span className="flex flex-row items-center mx-8">
									{arr.주식코드 && (
										<Typography className="text-13 mr-8 text-gray-500" color="inherit">
											종목코드 : {arr.주식코드}
										</Typography>
									)}
									{arr.사업자등록번호 && (
										<Typography className="text-13  text-gray-500" color="inherit">
											사업자등록번호 : {arr.사업자등록번호}
										</Typography>
									)}
								</span>
							</div>
						</div>
						<div className="flex flex-1 px-16 justify-end items-center">
							<DraggableIcon className="items-center" />
							<IconButton aria-label="more" color="inherit" edge="end">
								<Icon>more_vert</Icon>
							</IconButton>
						</div>
					</Toolbar>
				</AppBar> */}
				<CardHeader
					className="pr-24 pb-0"
					action={
						<IconButton aria-label="more" color="inherit" edge="end">
							<Icon>more_vert</Icon>
						</IconButton>
					}
					title={
						<div className="flex flex-row pl-12 items-center">
							<Typography variant="h6" color="inherit" className="min-w-96 pr-12" edge="start">
								기업 개요
							</Typography>
							<DraggableIcon />
							<Typography className="font-medium text-gray-600 ml-8" color="inherit">
								{arr.회사명}
							</Typography>
							<span className="flex flex-row items-center mx-8">
								{arr.종목코드 && (
									<Typography className="text-13 mr-8 text-gray-500" color="inherit">
										종목코드 : {arr.종목코드}
									</Typography>
								)}
								{/* {arr.사업자등록번호 && (
									<Typography className="text-13  text-gray-500" color="inherit">
										사업자등록번호 : {arr.사업자등록번호}
									</Typography>
								)} */}
							</span>
						</div>
					}
				/>
				<CardContent>
					<div className="flex flex-row justify-between items-start">
						<div className="flex w-full items-start">
							<div className="w-2/3 border-r-1 pr-8">
								{Object.entries(corpInfo).map(([key, value]) => (
									<Grid container key={key} spacing={2}>
										<Grid item xs={3}>
											<Typography variant="body1" color="textSecondary" className="pl-16">
												{key}
											</Typography>
										</Grid>
										<Grid item xs={9}>
											<Typography variant="body1" gutterBottom>
												{value}
											</Typography>
										</Grid>
									</Grid>
								))}
							</div>
							{/* <div className={clsx(classes.divider, 'mx-16 w-px h-320')} /> */}
							<div className="w-1/3 pr-8">
								{Object.entries(financeInfo).map(([key, value]) => (
									<Grid container key={key} spacing={1}>
										<Grid item xs={6}>
											<Typography variant="body1" color="textSecondary" className="pl-16">
												{key}
											</Typography>
										</Grid>
										<Grid item xs={6} className="text-right">
											<Typography variant="body1" gutterBottom>
												{value}
											</Typography>
										</Grid>
									</Grid>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default CorpInfo;
