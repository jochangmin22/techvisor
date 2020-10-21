import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import StockNewsContainer from '../StockNews/StockNewsContainer';
import CorpReport from '../CorpReport';
import ClinicTest from '../ClinicTest';
import OwnedPatent from '../OwnedPatent';
import Button from '@material-ui/core/Button';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper
	}
}));

function RelatedInfoContainer(props) {
	const classes = useStyles();
	const { selectedCode } = props;
	const [currentRange, setCurrentRange] = useState(0);

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	return (
		<div className={clsx(classes.root, 'w-full h-full rounded-8 shadow py-8')}>
			<div className="flex flex-col w-full sm:flex-row justify-between sm:px-12">
				<div className="flex flex-row items-center p-8 pb-0">
					<PopoverMsg
						title="뉴스·공시·임상·특허"
						msg="선택한 기업이 있으면 관련 정보를, 선택한 기업이 없으면 최근 정보를 표시합니다."
					/>
					<DraggableIcon />
					{selectedCode.corpName && (
						<Typography className="font-medium text-gray-600 ml-8" color="inherit">
							{selectedCode.corpName}
						</Typography>
					)}
				</div>
				<div className="flex w-full sm:w-288 mx-16 px-12 items-center">
					{['뉴스', '공시', '임상', '특허'].map((key, index) => {
						return (
							<Button
								key={index}
								className="normal-case shadow-none px-16"
								onClick={() => handleChangeRange(index)}
								color={currentRange === index ? 'default' : 'inherit'}
								variant={currentRange === index ? 'contained' : 'text'}
								size="small"
							>
								{key}
							</Button>
						);
					})}
				</div>
			</div>
			<div className="flex flex-row flex-wrap">
				{currentRange === 0 && (
					<div className="flex w-full">
						<StockNewsContainer selectedCode={selectedCode} />
					</div>
				)}
				{currentRange === 1 && (
					<div className="flex w-full">
						<CorpReport />
					</div>
				)}
				{currentRange === 2 && (
					<div className="flex w-full">
						<ClinicTest />
					</div>
				)}
				{currentRange === 3 && (
					<div className="flex w-full">
						<OwnedPatent />
					</div>
				)}
			</div>
		</div>
	);
}

export default RelatedInfoContainer;
