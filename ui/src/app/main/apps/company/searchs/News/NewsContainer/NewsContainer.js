import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import StockNewsContainer from '../StockNews/StockNewsContainer';
import CorpReport from '../CorpReport';
import ClinicTest from '../ClinicTest';
import Button from '@material-ui/core/Button';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper
	}
}));

function NewsContainer(props) {
	const classes = useStyles();
	const { selectCode } = props;

	// const analysisOptions = useSelector(({ companyApp }) => companyApp.searchs.analysisOptions);
	// const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	// const [showLoading, setShowLoading] = useState(false);
	const [currentRange, setCurrentRange] = useState(0);

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	// const isEmpty = !!(!searchText && !searchNum && !inventor && !assignee);
	const isEmpty = false; // temporaily

	return (
		<div className={clsx(classes.root, 'w-full h-full rounded-8 shadow py-8')}>
			<div className="flex flex-col w-full sm:flex-row justify-between sm:px-12">
				<div className="flex flex-row items-center">
					<PopoverMsg
						title="뉴스·공시·임상"
						msg="선택한 기업이 있으면 관련 정보를, 선택한 기업이 없으면 최근 정보를 표시합니다."
					/>
					<DraggableIcon />
				</div>

				<div className="flex w-full sm:w-320 mx-16 px-12 items-center">
					{['뉴스', '공시', '임상'].map((key, index) => {
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
				{
					currentRange === 0 && (
						// (isEmpty ? (
						// 	<EmptyMsg icon="mic_none" msg="뉴스" />
						// ) : (
						<div className="flex w-full">
							<StockNewsContainer selectCode={selectCode} />
						</div>
					)
					// ))
				}
				{currentRange === 1 &&
					(isEmpty ? (
						<EmptyMsg icon="message" msg="공시" />
					) : (
						<div className="flex w-full">
							<CorpReport selectCode={selectCode} />
						</div>
					))}
				{currentRange === 2 &&
					(isEmpty ? (
						<EmptyMsg icon="local_pharmacy" msg="임상" />
					) : (
						<div className="flex w-full">
							<ClinicTest selectCode={selectCode} />
						</div>
					))}
			</div>
		</div>
	);
}

export default NewsContainer;
