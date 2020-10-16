import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import searchData from 'app/main/apps/lib/mockDataSearchApp';
import { useForm } from '@fuse/hooks';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import MainTable from './searchs/SearchList/MainTable';
import VisualContainer from './searchs/Visual/VisualContainer';
import KeywordsContainer from './searchs/Keywords/KeywordsContainer';
import MatrixAnalysis from './searchs/Matrix/MatrixAnalysis';
import NewsContainer from './searchs/News/NewsContainer';
import Draggable from 'react-draggable';

const useStyles = makeStyles(theme => ({
	paper: {
		display: 'flex',
		width: '100%',
		height: '100%',
		padding: theme.spacing(1)
	}
}));

function SearchContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchText = useSelector(({ searchApp }) => searchApp.searchs.searchParams.searchText);
	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const searchLoading = useSelector(({ searchApp }) => searchApp.searchs.searchLoading);

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

	const noResult = !!(searchText && searchLoading === false && entities && entities.length === 0);
	const isEmpty = !!(!searchText && searchLoading === null && entities && entities.length === 0);

	if (noResult) {
		return <NoResultMsg />;
	}

	if (isEmpty) {
		return <EmptyMsg icon="chat" msg="검색결과" />;
	}

	return (
		<div className="flex h-full w-full justify-center">
			<div className="flex flex-wrap w-full h-460 items-start justify-center mt-8 px-8">
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('A')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.A }}>
						<KeywordsContainer />
					</div>
				</Draggable>
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('B')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.B }}>
						<VisualContainer />
					</div>
				</Draggable>
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('C')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.C }}>
						<MatrixAnalysis />
					</div>
				</Draggable>
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('D')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={clsx(classes.paper, 'md:w-1/2')} style={{ zIndex: form.D }}>
						<NewsContainer />
					</div>
				</Draggable>
				<Draggable
					handle=".draggable"
					onStart={() => handleStart('E')}
					onEnd={() => resetForm()}
					grid={[25, 25]}
				>
					<div className={classes.paper} style={{ zIndex: form.E }}>
						<MainTable />
					</div>
				</Draggable>
			</div>
		</div>
	);
}

export default SearchContent;
