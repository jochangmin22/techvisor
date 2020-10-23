import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyInfo, getFinancialInfo } from 'app/main/apps/company/store/searchsSlice';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import { numberToWon } from 'app/main/apps/lib/utils';

// const arr = {date: ['2017/12', '2018/12', '2019/12', '2019/12', '2020/03', '2020/06'],dataset: [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]};

const itemName = ['매출액(억)', '영업이익(억)', '당기순이익(억)', '부채비율', '자본유보율', '현금배당성향'];

function FinancialInfo() {
	const dispatch = useDispatch();
	const arr = useSelector(({ companyApp }) => companyApp.searchs.financialInfo);
	const selectedCorp = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp);
	const corpName = useSelector(({ companyApp }) => companyApp.searchs.companyInfo.회사명);

	useEffect(() => {
		const isEmpty = Object.values(selectedCorp).every(x => x === null || x === '');
		if (!isEmpty) {
			dispatch(getCompanyInfo(selectedCorp));
			dispatch(getFinancialInfo(selectedCorp));
		}
		// eslint-disable-next-line
	}, [selectedCorp]);

	useEffect(() => {}, [arr]);

	if (Object.values(arr).every(x => x === null || x === '')) return '';

	return (
		<div className="md:flex w-full">
			<Card className="w-full rounded-8">
				{/* <AppBar position="static" elevation={0}>
					<Toolbar className="px-8">
						<div className="flex flex-row justify-between">
							<Typography variant="subtitle1" color="inherit" className="px-12" edge="start">
								재무 정보
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
								재무 정보
							</Typography>
							<DraggableIcon />
							<Typography className="font-medium text-gray-600 ml-8" color="inherit">
								{corpName}
							</Typography>
							<span className="flex flex-row items-center mx-8">
								{selectedCorp.stockCode && (
									<Typography className="text-13 mr-8 text-gray-500" color="inherit">
										종목코드 : {selectedCorp.stockCode}
									</Typography>
								)}
								{selectedCorp.corpNo && (
									<Typography className="text-13  text-gray-500" color="inherit">
										사업자등록번호 : {selectedCorp.corpNo}
									</Typography>
								)}
							</span>
						</div>
					}
				/>
				<CardContent>
					<div className="flex justify-center items-center">
						<TableContainer>
							<Table size="small" aria-label="a dense table">
								<TableHead>
									<TableRow>
										<TableCell align="center" rowSpan={2} className="text-12 truncate">
											주요재무정보
										</TableCell>
										<TableCell align="center" colSpan={3} className="text-12 truncate">
											연도별 (최근 3년)
										</TableCell>
										<TableCell align="center" colSpan={3} className="text-12 truncate">
											분기별 (최근 3분기)
										</TableCell>
									</TableRow>
									<TableRow>
										{arr.date.map((row, index) => (
											<TableCell key={index} align="center" className="text-12 truncate">
												{row}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{arr.dataset.map((row, index) => (
										<TableRow key={index}>
											<TableCell component="th" scope="row" className="text-12 truncate">
												{itemName[index]}
											</TableCell>
											{row.map((val, index) => (
												<TableCell
													key={index}
													align="right"
													className={clsx(
														val < 0 ? 'text-red' : 'text-black',
														'text-12 truncate'
													)}
												>
													{index < 3 ? numberToWon(val) : val}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default FinancialInfo;
