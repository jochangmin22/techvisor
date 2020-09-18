import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import searchData from 'app/main/apps/lib/mockDataCompanyApp';
import { useForm } from '@fuse/hooks';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import SearchListContainer from './searchs/SearchList/SearchListContainer';
import CorpInfo from './searchs/CorpInfo';
import StockChart from './searchs/StockChart';
import Draggable from 'react-draggable';
import ClinicTest from './searchs/ClinicTest';

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
	const selectedCode = useSelector(({ companyApp }) => companyApp.searchs.selectedCode);
	const { stockCode, corpNo } = selectedCode;
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

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

	const noResult = !!(!searchLoading && entities && entities.length === 0);

	if (noResult) {
		return <NoResultMsg />;
	}

	if (!searchText) {
		return <EmptyMsg icon="chat" msg="검색결과" />;
	}

	return (
		<div className="flex flex-wrap w-full h-auto items-start justify-start mt-8 px-8">
			<Draggable handle=".draggable" onStart={() => handleStart('A')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={classes.paper} style={{ zIndex: form.A }}>
					<SearchListContainer />
				</div>
			</Draggable>
			<Draggable handle=".draggable" onStart={() => handleStart('B')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={classes.paper} style={{ zIndex: form.B }}>
					<CorpInfo />
				</div>
			</Draggable>
			<Draggable handle=".draggable" onStart={() => handleStart('C')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.C }}>
					<StockChart />
				</div>
			</Draggable>
			<Draggable handle=".draggable" onStart={() => handleStart('C')} onEnd={() => resetForm()} grid={[25, 25]}>
				<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.C }}>
					<ClinicTest />
				</div>
			</Draggable>
		</div>
	);
}

export default CompanyContent;
