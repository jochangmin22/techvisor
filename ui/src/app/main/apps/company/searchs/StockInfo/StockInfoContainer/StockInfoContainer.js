import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import StockChart from '../StockChart';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import { chartTypes } from 'app/main/apps/lib/variables';
import Typography from '@material-ui/core/Typography';
import { setChartType } from 'app/main/apps/company/store/searchSlice';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper
	}
}));

function StockInfoContainer() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);
	const corpName = useSelector(({ companyApp }) => companyApp.searchs.companyInfo.회사명);
	const [currentRange, setCurrentRange] = useState({
		name: 'day',
		text: '하루',
		unit: '5분'
	});

	function handleChangeRange(range) {
		setCurrentRange(range);
		dispatch(setChartType(range));
	}

	return (
		<div className={clsx(classes.root, 'w-full h-full rounded-8 shadow py-8')}>
			<div className="flex w-full justify-between">
				<div className="flex flex-row items-center p-12 pb-0">
					<Typography variant="h6" color="inherit" className="min-w-96 px-12" edge="start">
						시황 정보
					</Typography>
					<DraggableIcon />
					<Typography className="font-medium text-gray-600 ml-8" color="inherit">
						{corpName}
					</Typography>
					<span className="flex flex-row items-center mx-8">
						{selectedCode.stockCode && (
							<Typography className="text-13 mr-8 text-gray-500" color="inherit">
								종목코드 : {selectedCode.stockCode}
							</Typography>
						)}
						{selectedCode.corpNo && (
							<Typography className="text-13  text-gray-500" color="inherit">
								사업자등록번호 : {selectedCode.corpNo}
							</Typography>
						)}
					</span>
				</div>
				<div className="flex w-full sm:w-320 mx-16 px-12 items-center">
					{chartTypes.map(({ name, text }) => {
						return (
							<Button
								key={name}
								className="min-w-48 shadow-none text-11 px-16"
								onClick={() => handleChangeRange(name)}
								color={currentRange === name ? 'default' : 'inherit'}
								variant={currentRange === name ? 'contained' : 'text'}
								size="small"
							>
								{text}
							</Button>
						);
					})}
				</div>
			</div>
			<StockChart />
		</div>
	);
}

export default StockInfoContainer;
