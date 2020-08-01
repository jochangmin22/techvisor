import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/styles';
import _ from '@lodash';
import { company, government } from 'app/main/apps/lib/variables';
import parseSearchText from 'app/main/apps/lib/parseSearchText';
import { setSearchParams, setSearchSubmit, initialState } from '../../store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useUpdateEffect } from '@fuse/hooks';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
// TODO : Vitualize needed
// TODO : 테이블 높이 조정 nested 화
// FIXME : 테이블 항목 클릭하면 검색옵션에 삽입되게
const classifyState = {
	PUB: {
		label: '공공기관',
		maxValue: 0,
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	},
	COMP: {
		label: '기업',
		maxValue: 0,
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	},
	PERS: {
		label: '개인',
		maxValue: 0,
		data: [
			{
				name: '출원인 1',
				value: 3621
			}
		]
	}
};

function Classify(props) {
	const theme = useTheme();
	const dispatch = useDispatch();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);

	const [data, setData] = useState(classifyState);

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [form, setForm] = useState(searchParams || initialState.searchParams);

	useUpdateEffect(() => {
		const [newParams] = parseSearchText(form, null);
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
				.value();

			a = _.isEmpty(a) ? {} : a;

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

			// _.set(data, "rows.KR.PUB", PUB);
			// _.set(data, "rows.KR.COMP", COMP);
			// _.set(data, "rows.KR.PERS", PERS);
			// setData(data);

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
			// console.log(payload);
			// console.log(updatedState);
			return updatedState;
		}

		if (entities) {
			setData(updateState(getStats(entities)));
			// getStats(searchs);
		}
		// eslint-disable-next-line
	}, [props.searchText, entities]);

	const columns = useMemo(() => {
		return [
			{
				Header: '출원인명',
				accessor: 'name',
				className: 'text-11 p-4',
				sortable: true,
				width: 80
				// Cell: row => (
				// 	<span>
				// 		<span
				// 			style={{
				// 				color: theme.palette.primary.main,
				// 				transition: 'all .3s ease'
				// 			}}
				// 		>
				// 			&#10625;
				// 		</span>{' '}
				// 		{row.value}
				// 	</span>
				// )
			},
			{
				header: '건수',
				accessor: 'value',
				className: 'text-11 p-4',
				sortable: true
			}
		];
	}, [theme.palette.primary.main]);

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
						<Paper className="flex w-full sm:w-1/3 flex-col rounded-8 shadow p-8" key={index}>
							<Typography variant="body1">{data[v].label}</Typography>
							<FuseScrollbars className="w-full max-h-384">
								<EnhancedTable
									columns={columns}
									data={data[v].data}
									size="small"
									showFooter={false}
									onRowClick={(ev, row) => {
										if (row) {
											handleClick(row.name);
										}
									}}
								/>
							</FuseScrollbars>
						</Paper>
					))}
				</div>
			</Paper>
		</FuseAnimateGroup>
	);
}
export default Classify;
// <Table className={classes.sizeSmall} stickyHeader>
// 	<TableHead>
// 		<TableRow>
// 			<TableCell className={classes.tableHead}></TableCell>
// 			<TableCell component="th" className={classes.tableHead}>
// 				출원인명
// 			</TableCell>
// 			<TableCell
// 				className={clsx(classes.tableHead, 'w-28')}
// 				component="th"
// 				align="right"
// 			>
// 				건수
// 			</TableCell>
// 		</TableRow>
// 	</TableHead>
// 	<TableBody>
// 		{data.rows[currentRange][v].data.map((row, index) => (
// 			<TableRow className="cursor-pointer" key={row.name}>
// 				<TableCell className={classes.tableRow} component="th" scope="row">
// 					{index + 1}
// 				</TableCell>
// 				<TableCell
// 					className={classes.tableRow}
// 					onClick={() => {
// 						handleClick(row.name);
// 					}}
// 				>
// 					{row.name}
// 				</TableCell>
// 				<TableCell className={classes.tableRow} align="right">
// 					{row.value}
// 				</TableCell>
// 			</TableRow>
// 		))}
// 	</TableBody>
// </Table>;
