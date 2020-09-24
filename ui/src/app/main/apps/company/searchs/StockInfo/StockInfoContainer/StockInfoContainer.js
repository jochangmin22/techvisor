import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import StockChart from '../StockChart';
import StockInfo from '../StockInfo';

function StockInfoContainer() {

	return (
		<div className="md:flex w-full">
			<Card className="w-full rounded-8">
				<CardContent className="pl-8">
					<div className="flex flex-row justify-center items-start">
						<div className="w-200">
							<StockInfo />
						</div>
						<div className="flex flex-1">
							<StockChart />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default StockInfoContainer;
