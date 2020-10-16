import React, { useEffect, useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { useDispatch, useSelector } from 'react-redux';
import { getStockInfo } from 'app/main/apps/company/store/searchsSlice';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';

function StockInfo() {
	const dispatch = useDispatch();
	const arr = useSelector(({ companyApp }) => companyApp.searchs.stock.stockInfo);
	const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);

	useEffect(() => {
		const isEmpty = Object.values(selectedCode).every(x => x === null || x === '');
		if (!isEmpty) {
			dispatch(getStockInfo(selectedCode));
		}
		// eslint-disable-next-line
	}, [selectedCode]);

	const stockInfo = useMemo(
		() =>
			arr && arr.length !== 0
				? {
						시가총액: arr.시가총액,
						'주가(월)': '', // arr.korreprnm,
						'거래량(주)': arr.거래량,
						'수익률(일)': arr.수익률1d ? arr.수익률1d + '%' : '',
						'수익률(월)': arr.수익률1m ? arr.수익률1m + '%' : '',
						'수익률(년)': arr.수익률1y ? arr.수익률1y + '%' : '',
						'PER(배)': arr['PER(배)'],
						'PBR(배)': arr['PBR(배)'],
						'ROE(%)': arr['ROE(%)'] ? arr['ROE(%)'] + '%' : '',
						'EPS(원)': arr['EPS(원)'] ? arr['EPS(원)'] + '원' : ''
				  }
				: {},
		[arr]
	);

	if (!arr || arr.length === 0) return '';

	return (
		<div className="md:flex w-full pr-8">
			<Card className="border-0 w-full" variant="outlined">
				<CardHeader
					className="px-8 pt-4 pb-0"
					title={
						<div className="flex flex-row pl-12 items-center">
							<Typography variant="h6" color="inherit" className="min-w-96 pr-12" edge="start">
								시황 정보
							</Typography>
							{/* <Typography variant="subtitle2" color="inherit" className="pr-12" edge="start">
								
							</Typography> */}
							<DraggableIcon className="items-center" />
						</div>
					}
				/>
				<CardContent className="px-8 pt-16 pb-0">
					<div className="flex flex-col w-full items-start">
						{Object.entries(stockInfo).map(([key, value]) => (
							<Grid container key={key} spacing={1}>
								<Grid item xs={7}>
									<Typography variant="body1" color="textSecondary" className="p-0">
										{key}
									</Typography>
								</Grid>
								<Grid item xs={5} className="text-right">
									<Typography variant="body1" gutterBottom>
										{value}
									</Typography>
								</Grid>
							</Grid>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default StockInfo;
