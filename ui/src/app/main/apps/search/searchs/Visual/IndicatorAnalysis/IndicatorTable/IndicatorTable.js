import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithBlockLayout';

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	table: {
		'&.sticky': {
			overflow: 'scroll',
			'& thead, & .tfooter': {
				position: 'sticky',
				zIndex: 1,
				width: 'fit-content'
			},
			'& tbody': {
				position: 'relative',
				zIndex: 0
			},
			'& [data-sticky-td]': {
				position: 'sticky',
				backgroundColor: theme.palette.background.default,
				'&:hover': {
					backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,.04)'
				}
			}
			// '& [data-sticky-last-left-td]': {
			// 	boxShadow: '1px 0px 0px #ccc'
			// }
		}
	}
}));

function IndicatorTable(props) {
	const theme = useTheme();
	const classes = useStyles();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.indicator);

	const [data, setData] = useState([]);
	const [maxValue, setMaxValue] = useState([]);

	useEffect(() => {
		if (entities && entities.length > 0) {
			let val = [];
			['citing', 'cnt', 'cpp', 'pii', 'ts', 'pfs'].map(key => {
				val.push(
					Math.max.apply(
						Math,
						entities.map(function (o) {
							return o[key];
						})
					)
				);
				return '';
			});
			setMaxValue(val);
			setData(entities);
		}
		// eslint-disable-next-line
	}, [props.searchText, entities]);

	const defaultColumn = useMemo(
		() => ({
			width: 80
		}),
		[]
	);

	const columns = useMemo(() => {
		function getColor(value, index) {
			const hue = maxValue && value ? (value / maxValue[index]).toFixed(1) * 10 : 0;
			if (hue === 0 || isNaN(hue)) {
				return 'font-normal text-blue-100';
			} else if (hue > 0 && hue < 10) {
				return 'font-normal text-blue-' + hue * 100;
			} else if (hue === 10) {
				return 'font-extrabold text-blue-900 text-12';
			}
		}

		return [
			{
				Header: '출원인',
				accessor: 'name',
				Cell: row => (
					<span>
						<span
							style={{
								color: theme.palette.text.primary,
								transition: 'all .3s ease'
							}}
						>
							&#10625;
						</span>{' '}
						{row.value}
					</span>
				),
				className: 'text-12 overflow-hidden',
				sortable: true,
				width: 180,
				sticky: 'left'
			}
		].concat(
			['피인용수', '총등록건', 'CPP', 'PII', 'TS', 'PFS'].map((item, index) => ({
				Header: item,
				accessor: ['citing', 'cnt', 'cpp', 'pii', 'ts', 'pfs'][index],
				className: 'text-12',
				width: [80, 80, 65, 65, 65, 65][index],
				sortable: true,
				Cell: props => {
					return (
						<div className={getColor(props.cell.value, index)}>
							<span title={props.cell.value}>{props.cell.value}</span>
						</div>
					);
				}
			}))
		);
	}, [maxValue, theme.palette.text.primary]);

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<div className={clsx(classes.paper, 'w-full h-full shadow-none px-8')}>
			{/* <FuseScrollbars className="max-h-360 w-256 sm:w-400 md:w-320 lg:w-620 xl:w-620 px-8"> */}
			<FuseScrollbars className="mx-8">
				<EnhancedTable
					columns={columns}
					data={data}
					defaultColumn={defaultColumn}
					size="small"
					className={classes.table}
					pageSize={9}
					pageOptions={[9, 18, 27]}
					onRowClick={(ev, row) => {
						if (row) {
						}
					}}
				/>
			</FuseScrollbars>
		</div>
	);
}

export default IndicatorTable;
