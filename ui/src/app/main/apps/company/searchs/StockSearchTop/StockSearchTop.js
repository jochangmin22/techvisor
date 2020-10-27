import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
	getStockSearchTop
	// resetSelectedCorp,
	// setSelectedCorp,
	// setSearchSubmit
} from 'app/main/apps/company/store/searchsSlice';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithBlockLayout';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import { useDispatch, useSelector } from 'react-redux';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

const useStyles = makeStyles(theme => ({
	root: { backgroundColor: theme.palette.background.paper },
	label: { backgroundColor: theme.palette.primary.dark }
}));

const columnName = {
	순위: '60',
	종목명: '120',
	검색비율: '70',
	현재가: '70',
	전일비: '70',
	등락률: '60',
	거래량: '90',
	시가: '80',
	고가: '80',
	저가: '80',
	PER: '70',
	ROE: '70'
};

const columns = Object.entries(columnName).map(([key, value]) => {
	const align = key === '순위' || key === '종목명' ? 'text-left' : 'text-right';
	return {
		Header: key,
		accessor: key,
		className: clsx(align, 'text-12 font-400 truncate'),
		sortable: true,
		width: value,
		Cell: ({ cell }) => {
			return (
				<div>
					<span
						className={clsx(
							cell.column.id === '등락률' && cell.value < 0
								? 'text-blue'
								: cell.column.id === '등락률' && cell.value > 0
								? 'text-red'
								: 'text-black'
						)}
						title={cell.value}
					>
						{cell.value}
					</span>
				</div>
			);
		}
	};
});

function addZeroes(num) {
	return num === 0 || isNaN(num) ? 0 : Number(num).toFixed(2);
}

function StockSearchTop() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const stockSearchTop = useSelector(({ companyApp }) => companyApp.searchs.stockSearchTop);
	const data = useMemo(
		() =>
			stockSearchTop
				? stockSearchTop.map(row => ({
						...row,
						검색비율: addZeroes(row['검색비율']),
						등락률: addZeroes(row['등락률']),
						PER: addZeroes(row['PER']),
						ROE: addZeroes(row['ROE'])
				  }))
				: [],
		[stockSearchTop]
	);

	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		setShowLoading(true);
		dispatch(getStockSearchTop()).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, []);

	// const handleClick = (name, stockCode, corpNo) => {
	// 	dispatch(resetSelectedCorp());
	// 	dispatch(setSelectedCorp({ stockCode: stockCode, corpNo: corpNo, corpName: name }));
	// 	dispatch(setSearchSubmit(true));
	// };

	const isEmpty = !!(stockSearchTop.length === 0 && !showLoading);

	return (
		<div className={clsx(classes.root, 'h-full w-full rounded-8 shadow py-8')}>
			<div className="flex flex-col w-full sm:flex-row justify-between sm:px-12">
				<div className="flex flex-row items-center p-8 pb-0">
					<PopoverMsg title="검색상위 종목" msg="국내증시의 네이버 검색상위 종목을 표시합니다." />
					<DraggableIcon />
				</div>
				<div className="px-12 flex items-center justify-end mb-8">
					<Typography className={clsx(classes.label, 'text-13 font-400 rounded-4 text-white px-8 py-4')}>
						검색 결과 {Number(data.length).toLocaleString()} 건
					</Typography>
				</div>
			</div>
			{isEmpty ? (
				<EmptyMsg icon="camera" msg="종목검색 상위" text="내용이 없습니다." className="h-320" />
			) : (
				<FuseScrollbars className="max-h-400 px-6">
					{showLoading ? (
						<SpinLoading className="h-400" />
					) : (
						<EnhancedTable
							columns={columns}
							data={data}
							size="small"
							onRowClick={(ev, row) => {
								if (row) {
									// TODO: handleClick(row.original.회사명, row.original.종목코드);
								}
							}}
						/>
					)}
				</FuseScrollbars>
			)}
		</div>
	);
}

export default StockSearchTop;
