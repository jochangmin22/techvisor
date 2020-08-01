import React, { useState, useEffect } from 'react';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { useTheme, makeStyles } from '@material-ui/styles';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import _ from '@lodash';
import { Line } from 'rc-progress';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import parseSearchText from 'app/main/apps/lib/parseSearchText';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { getSubjectRelationVec, setSearchParams, setSearchSubmit, initialState } from '../../store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useUpdateEffect } from '@fuse/hooks';

const useStyles = makeStyles(theme => ({
	word: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

// TODO : 클릭한 핵심 키워드 (Chip)도 표시
function SubjectTable() {
	const theme = useTheme();
	const classes = useStyles();
	const dispatch = useDispatch();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.subjectRelation.vec);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const [form, setForm] = useState(searchParams || initialState.searchParams);

	function handleClick(value, name = 'terms') {
		let array = [...form[name]];
		const newValue = value.trim().replace(/\s+/g, ' ADJ1 ');
		let existCheck = true;
		array.map(arr => {
			if (arr.includes(newValue)) {
				return (existCheck = false);
			}
			return true;
		});
		if (existCheck) {
			array.push([newValue]);
		} else {
			dispatch(
				showMessage({
					message: '이미 포함되어 있습니다.',
					autoHideDuration: 2000
				})
			);
		}
		setForm(_.set({ ...form }, name, array));

		dispatch(setSearchSubmit(true));
	}

	useUpdateEffect(() => {
		const [_params] = parseSearchText(form, null);
		dispatch(setSearchParams(_params));
	}, [form]);

	useEffect(() => {}, [entities]);

	useEffect(() => {
		const [, params] = parseSearchText(searchParams, null);
		const subParams = {
			analysisOptions: analysisOptions
		};
		dispatch(getSubjectRelationVec({ params, subParams }));
	}, [dispatch, searchParams, analysisOptions.subjectRelationOptions.keywordvec]);

	// if (!entities) {
	// 	return <SpinLoading />;
	// }

	return !entities ? (
		<SpinLoading />
	) : (
		<FuseScrollbars className="max-h-288 px-12 py-0 items-center">
			<MuiTable stickyHeader size="small">
				<TableHead>
					<TableRow>
						<TableCell className="text-right">Surrounding word</TableCell>
						<TableCell className="text-right" colSpan={2}>
							Probability of occurrence
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{entities.map(row => (
						<TableRow className="cursor-pointer" key={row.label}>
							{/*onClick={event => handleClick(row.label)}>*/}
							<TableCell
								component="th"
								scope="row"
								align="right"
								onClick={() => {
									handleClick(row.label);
								}}
							>
								<Typography
									className={clsx(
										'inline text-11 font-500 px-8 py-4 rounded-4 cursor-pointer hover:bg-indigo-400 focus:outline-none focus:shadow-outline active:bg-indigo-600',
										classes.word
									)}
								>
									{row.label}
								</Typography>
							</TableCell>
							<TableCell component="th" scope="row" align="right">
								{row.value && row.value.toFixed(3)}
							</TableCell>
							<TableCell component="th" scope="row" align="right">
								<div className="w-72">
									<Line
										percent={[(row.value * 100).toFixed(0), 100 - (row.value * 100).toFixed(0)]}
										strokeWidth="8"
										strokeColor={[theme.palette.primary.main, theme.palette.primary.light]}
									/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</MuiTable>
		</FuseScrollbars>
	);
}

export default SubjectTable;
