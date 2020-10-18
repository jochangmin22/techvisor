import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import searchData from 'app/main/apps/lib/mockDataCompanyApp';
import { useForm, useUpdateEffect } from '@fuse/hooks';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import SearchListContainer from './searchs/SearchList/SearchListContainer';
import CorpInfo from './searchs/CorpInfo';
import StockInfoContainer from './searchs/StockInfo/StockInfoContainer';
import RelatedInfoContainer from './searchs/RelatedInfo/RelatedInfoContainer';
import Draggable from 'react-draggable';
import StockFairValue from './searchs/StockFairValue';

const useStyles = makeStyles(theme => ({
	paper: {
		display: 'flex',
		width: '100%',
		height: '100%',
		padding: theme.spacing(1)
	}
}));

function CompanyContent() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const stockCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode.stockCode);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

	const [searchStatus, setSearchStatus] = useState(null);

	const [selectCode, setSelectCode] = useState(stockCode || '주식');

	const { form, setForm, resetForm } = useForm({
		A: 100,
		B: 100,
		C: 100,
		D: 100,
		E: 100
	});

	function handleStart(name) {
		resetForm();
		setForm({ [name]: 101 });
	}

	// 개발용 mock data 넣기
	useEffect(() => {
		dispatch(setMockData(searchData));
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!!(searchText && !searchLoading && entities && entities.length === 0)) {
			setSearchStatus('noResults');
		}
		if (!searchText) {
			setSearchStatus('notStarted');
		}
		if (entities && entities.length > 0) {
			setSearchStatus(null);
		}
	}, [searchText, searchLoading, entities]);

	useUpdateEffect(() => {
		setSelectCode(stockCode || '주식');
	}, [stockCode]);

	return (
		<div className="flex flex-wrap w-full h-auto items-start justify-start mt-8 px-8">
			<Draggable handle=".draggable" onStart={() => handleStart('A')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={classes.paper} style={{ zIndex: form.A }}>
					<SearchListContainer status={searchStatus} />
				</div>
			</Draggable>
			{stockCode && stockCode.length !== 0 && (
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('B')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.B }}>
						<CorpInfo />
					</div>
				</Draggable>
			)}
			{stockCode && stockCode.length !== 0 && (
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('C')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.C }}>
						<StockInfoContainer />
					</div>
				</Draggable>
			)}
			<Draggable handle=".draggable" onStart={() => handleStart('D')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.D }}>
					<RelatedInfoContainer selectCode={selectCode} />
				</div>
			</Draggable>
			<Draggable handle=".draggable" onStart={() => handleStart('E')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.E }}>
					<StockFairValue />
				</div>
			</Draggable>
		</div>
	);
}

export default CompanyContent;
