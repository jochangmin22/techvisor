import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSearchs } from './store/searchsSlice';
// import { setMockData, getSearchs } from './store/searchsSlice';
// import searchData from 'app/main/apps/lib/mockDataCompanyApp';
// import { authRoles } from "app/auth";
import { useForm } from '@fuse/hooks';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import SearchListContainer from './searchs/SearchList/SearchListContainer';
import FinancialInfo from './searchs/FinancialInfo';
import StockInfoContainer from './searchs/StockInfo/StockInfoContainer';
import RelatedInfoContainer from './searchs/RelatedInfo/RelatedInfoContainer';
import VisualContainer from './searchs/Visual/VisualContainer';
import Draggable from 'react-draggable';
import StockSearchTop from './searchs/StockSearchTop';

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
	const selectedCorp = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

	const [searchStatus, setSearchStatus] = useState(null);

	const { form, setForm, resetForm } = useForm({
		A: 100,
		B: 100,
		C: 100,
		D: 100,
		E: 100,
		F: 100
	});

	function handleStart(name) {
		resetForm();
		setForm({ [name]: 101 });
	}

	// 개발용 mock data 넣기
	// useEffect(() => {
	// 	dispatch(setMockData(searchData));
	// 	// eslint-disable-next-line
	// }, []);

	useEffect(() => {
		const params = {
			params: { searchText: 'all' },
			subParams: {}
		};
		dispatch(getSearchs(params));
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

	const selectOne = !Object.values(selectedCorp).every(x => x === null || x === '');

	return (
		<div className="flex h-full w-full justify-center">
			<div className="flex flex-wrap w-full h-460 items-start justify-start mt-8 px-8">
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('A')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={classes.paper} style={{ zIndex: form.A }}>
						<SearchListContainer status={searchStatus} />
					</div>
				</Draggable>
				{selectOne && (
					<>
						<Draggable
							handle=".draggable"
							onStart={() => handleStart('B')}
							onEnd={() => resetForm()}
							grid={[25, 25]}
						>
							<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.B }}>
								<FinancialInfo />
							</div>
						</Draggable>
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
					</>
				)}
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('D')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.D }}>
						<RelatedInfoContainer selectedCorp={selectedCorp} />
					</div>
				</Draggable>
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('E')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.E }}>
						<StockSearchTop />
					</div>
				</Draggable>
				{selectOne && (
					<Draggable
						handle=".draggable"
						onStart={() => handleStart('F')}
						onEnd={() => resetForm()}
						grid={[25, 25]}
					>
						<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.F }}>
							<VisualContainer />
						</div>
					</Draggable>
				)}
			</div>
		</div>
	);
}

export default CompanyContent;
