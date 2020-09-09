import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
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
import { company, government } from 'app/main/apps/lib/variables';
import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
import { setSearchParams, setSearchSubmit, initialState } from 'app/main/apps/search/store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useUpdateEffect } from '@fuse/hooks';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
// TODO : Vitualize needed
// TODO : 테이블 높이 조정 nested 화
// FIXME : 테이블 항목 클릭하면 검색옵션에 삽입되게

const classifyState = {
	PUB: {
		label: '공공기관',
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	},
	COMP: {
		label: '기업',
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	},
	PERS: {
		label: '개인',
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	}
};

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
	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);

	const [data, setData] = useState(classifyState);

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [form, setForm] = useState(searchParams || initialState.searchParams);

	useUpdateEffect(() => {
		const [newParams] = parseSearchOptions(form);
		dispatch(setSearchParams(newParams));
	}, [form]);

	function handleClick(value, name = 'assignee') {
		const array = [...form[name]];
		const newValue = value.trim();
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

	useEffect(() => {
		function getStats(arr) {
			let re = [];
			let a = _.chain(arr)
				.filter(item => !!item['출원인1'])
				.filter(item => !String(item['출원인코드1']).startsWith('4'))
				.groupBy('출원인1')
				.map((value, key) => ({ name: key, value: value.length }))
				.orderBy(['value'], ['desc'])
				// .splice(0, 10)
				.defaultsDeep({})
				.value();

			// https://stackoverflow.com/questions/46226572/lodash-filter-by-single-value-and-value-in-array
			try {
				// PUB.label = "공공기관";
				re.PUB = _.filter(a, function (item) {
					let res = false;
					government.forEach(o => {
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
					let res = false;
					company.forEach(o => {
						if (_.includes(item.name, o)) res = true;
					});
					return res;
				});
			} catch (e) {
				re.COMP = [];
			}

			let b = _.chain(arr)
				.filter(item => !!item['출원인1'])
				.filter(item => String(item['출원인코드1']).startsWith('4'))
				.groupBy('출원인1')
				.map((value, key) => ({ name: key, value: value.length }))
				.orderBy(['value'], ['desc'])
				// .splice(0, 10)
				.defaultsDeep({})
				.value();

			try {
				// PERS.label = "개인";
				re.PERS = b.filter(n => !re.PUB.includes(n) && !re.COMP.includes(n));
			} catch (e) {
				re.PERS = [];
			}

			return re;
		}

		function updateState(payload) {
			const updatedState = {
				...data,
				PUB: {
					...data.PUB,
					data: payload.PUB
				},
				COMP: {
					...data.COMP,
					data: payload.COMP
				},
				PERS: {
					...data.PERS,
					data: payload.PERS
				}
			};
			return updatedState;
		}

		if (entities) {
			setData(updateState(getStats(entities)));
			// getStats(entities);
		}
		// eslint-disable-next-line
	}, [props.searchText, entities]);

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<FuseAnimateGroup
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<Paper className="w-full shadow-none">
				<div className="flex flex-col sm:flex sm:flex-row p-8 container">
					{['PUB', 'COMP', 'PERS'].map((v, index) => (
						<Card className="flex w-full sm:w-1/3 flex-col rounded-8 shadow p-8" key={index}>
							<Typography variant="body1">{data[v].label}</Typography>
							<FuseScrollbars className="w-full max-h-320">
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
										{data[v].data.map((row, index) => (
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