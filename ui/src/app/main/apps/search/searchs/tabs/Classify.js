import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
// import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
// import { PropTypes } from "prop-types";
// import { FixedSizeList } from "react-window";
import { makeStyles } from '@material-ui/core/styles';
import _ from '@lodash';
import clsx from 'clsx';
import classifyState from './setClassifyState';
import parseSearchText from '../../inc/parseSearchText';
import { setSearchParams, initialState } from '../../store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useUpdateEffect } from '@fuse/hooks';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
// TODO : Vitualize needed
// TODO : 테이블 높이 조정 nested 화
// FIXME : 테이블 항목 클릭하면 검색옵션에 삽입되게
const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing(3),
		padding: theme.spacing(1)
	},
	// table: {
	//     minWidth: 199,
	//     padding: theme.spacing(1)
	// },
	// tableWrapper: {
	//     overflowX: "auto"
	// },
	sizeSmall: {
		paddingTop: 2,
		paddingBottom: 2
	},
	tableHead: {
		fontSize: 11,
		fontWeight: 600,
		flexGrow: 0,
		flexShrink: 1,
		flexBasis: 'auto',
		padding: 2
	},
	tableRow: {
		fontSize: 11,
		padding: 2
		// fontWeight: 600
	}
	// toolbar: {
	//     height: 28,
	//     minHeight: 28,
	//     padding: theme.spacing(1)
	// },
	// spacer: {
	//     flexGrow: 0,
	//     flexShrink: 1,
	//     flexBasis: "auto"
	// },
	// caption: {
	//     fontSize: 10
	// }
}));

// function renderRow(props) {
//     const { data, index, style } = props;
//     const item = data[index];

//     return (
//         <ListItem
//             key={index}
//             role={undefined}
//             dense
//             style={style}
//             button
//             // onClick={handleToggle(value)}
//         >
//             <ListItemIcon>
//                 <div>{index + 1}</div>
//             </ListItemIcon>
//             <ListItemText style={style} primary={item.name} />
//             <ListItemSecondaryAction>{item.value}</ListItemSecondaryAction>
//         </ListItem>
//     );
// }

function Classify(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);

	const [currentRange, setCurrentRange] = useState('KR');

	const [filteredData, setFilteredData] = useState(classifyState.classifyDB);

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [form, setForm] = useState(searchParams || initialState.searchParams);

	useUpdateEffect(() => {
		const [newParams] = parseSearchText(form, null);
		dispatch(setSearchParams(newParams));
	}, [form]);

	function handleClick(value, name = 'assignee') {
		const newArray = form[name];
		const newValue = value.trim();
		let existCheck = true;
		newArray.map(arr => {
			if (arr.includes(newValue)) {
				return (existCheck = false);
			}
			return true;
		});
		if (existCheck) {
			newArray.push([newValue]);
		} else {
			dispatch(
				showMessage({
					message: '이미 포함되어 있습니다.',
					autoHideDuration: 2000
					// anchorOrigin: {
					// 	vertical: 'top',
					// 	horizontal: 'right'
					// }
				})
			);
		}
		setForm(_.set({ ...form }, name, newArray));
	}

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	useEffect(() => {
		function getStats(arr) {
			var re = [];
			var a = _.chain(arr)
				.filter(item => !!item['출원인1'])
				.filter(item => !String(item['출원인코드1']).startsWith('4'))
				.groupBy('출원인1')
				.map((value, key) => ({ name: key, value: value.length }))
				.orderBy(['value'], ['desc'])
				// .splice(0, 10)
				.value();

			a = _.isEmpty(a) ? {} : a;

			// https://stackoverflow.com/questions/46226572/lodash-filter-by-single-value-and-value-in-array
			try {
				// PUB.label = "공공기관";
				re.PUB = _.filter(a, function (item) {
					var res = false;
					classifyState.government.forEach(o => {
						if (_.includes(item.name, o)) res = true;
					});
					return res;
				});
			} catch (e) {
				re.PUB = [];
			}
			try {
				// COMP.label = "기업";
				re.COMP = _.filter(a, function (item) {
					var res = false;
					classifyState.company.forEach(o => {
						if (_.includes(item.name, o)) res = true;
					});
					return res;
				});
			} catch (e) {
				re.COMP = [];
			}

			var b = _.chain(arr)
				.filter(item => !!item['출원인1'])
				.filter(item => String(item['출원인코드1']).startsWith('4'))
				.groupBy('출원인1')
				.map((value, key) => ({ name: key, value: value.length }))
				.orderBy(['value'], ['desc'])
				// .splice(0, 10)
				.value();

			b = _.isEmpty(b) ? {} : b;

			try {
				// PERS.label = "개인";
				re.PERS = b.filter(n => !re.PUB.includes(n) && !re.COMP.includes(n));
			} catch (e) {
				re.PERS = [];
			}
			// re.PUB = _.isEmpty(re.PUB) ? [] : re.PUB;
			// re.COMP = _.isEmpty(re.COMP) ? [] : re.COMP;
			// re.PERS = _.isEmpty(re.PERS) ? [] : re.PERS;

			// _.set(filteredData, "rows.KR.PUB", PUB);
			// _.set(filteredData, "rows.KR.COMP", COMP);
			// _.set(filteredData, "rows.KR.PERS", PERS);
			// setFilteredData(filteredData);

			return re;
		}

		function updateState(payload) {
			const updatedState = {
				...filteredData,
				rows: {
					...filteredData.rows,
					KR: {
						...filteredData.rows.KR,
						PUB: {
							...filteredData.rows.KR.PUB,
							data: payload.PUB
						},
						COMP: {
							...filteredData.rows.KR.COMP,
							data: payload.COMP
						},
						PERS: {
							...filteredData.rows.KR.PERS,
							data: payload.PERS
						}
					}
				}
			};
			// console.log(payload);
			// console.log(updatedState);
			return updatedState;
		}

		if (searchs) {
			setFilteredData(updateState(getStats(searchs)));
			// getStats(searchs);
		}
		// eslint-disable-next-line
	}, [props.searchText, searchs]);

	if (!searchs || searchs.length === 0) {
		return <SpinLoading />;
	}

	return (
		<FuseAnimateGroup
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<Paper className="w-full shadow-none">
				<div className="flex items-center justify-between px-16 py-8 border-b-1">
					<Typography variant="body1" className="hidden xs:flex">
						{filteredData.title}
					</Typography>
					<div className="items-center">
						{Object.entries(filteredData.ranges).map(([key, n]) => {
							return (
								<Button
									key={key}
									size="small"
									className="normal-case shadow-none px-0 sm:px-0 text-11"
									onClick={() => handleChangeRange(key)}
									color={currentRange === key ? 'primary' : 'default'}
									variant={currentRange === key ? 'contained' : 'text'}
								>
									{n}
								</Button>
							);
						})}
					</div>
				</div>
				<div className="flex flex-col sm:flex sm:flex-row p-8 container">
					{['PUB', 'COMP', 'PERS'].map((v, index) => (
						<Card className="flex w-full sm:w-1/3 flex-col rounded-8 shadow p-8" key={index}>
							<Typography variant="body1">{filteredData.rows[currentRange][v].label}</Typography>
							<FuseScrollbars className="w-full max-h-224">
								<Table className={classes.sizeSmall} stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell className={classes.tableHead}></TableCell>
											<TableCell component="th" className={classes.tableHead}>
												출원인명
											</TableCell>
											<TableCell
												className={clsx(classes.tableHead, 'w-28')}
												component="th"
												align="right"
											>
												건수
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredData.rows[currentRange][v].data.map((row, index) => (
											<TableRow className="cursor-pointer" key={row.name}>
												<TableCell className={classes.tableRow} component="th" scope="row">
													{index + 1}
												</TableCell>
												<TableCell
													className={classes.tableRow}
													onClick={() => {
														handleClick(row.name);
													}}
												>
													{row.name}
												</TableCell>
												<TableCell className={classes.tableRow} align="right">
													{row.value}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</FuseScrollbars>
						</Card>
					))}
				</div>
			</Paper>
		</FuseAnimateGroup>
	);
}
export default Classify;
