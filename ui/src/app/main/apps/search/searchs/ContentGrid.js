import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDebounce } from '@fuse/hooks';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from '../store/actions';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'app/../styles/ag-theme-alpine.css'; // change font
import 'app/../styles/ag-theme-alpine-dark.css'; // change font
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import Highlighter from 'react-highlight-words';
import DownloadFilterMenu from './components/DownloadFilterMenu';
import FakeServer from './FakeServer';

/* TODO : handle grid dark mode */
/* TODO : switch to infinite mode to use the community version */

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
		height: '620px',
		// padding: theme.spacing(2),
		// paddingTop: theme.spacing(0),
		// paddingBottom: theme.spacing(2),
		// paddingLeft: theme.spacing(2),
		// paddingRight: theme.spacing(2),
		backgroundColor: theme.palette.background.default
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2)
	},
	dark: theme.palette.type === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'
}));

const columnDefs = [
	{
		headerName: '출원번호',
		field: '출원번호',
		width: 180,
		checkboxSelection: true
	},
	{
		headerName: '출원일',
		field: '출원일자',
		width: 110
	},
	{
		headerName: '상태',
		field: '등록사항',
		width: 80
	},
	{
		headerName: '발명의명칭(국문)',
		field: '발명의명칭(국문)',
		width: 500
		// cellRenderer: 'highlightCellRenderer'
	},
	{
		headerName: '출원인',
		field: '출원인1',
		width: 250
		// cellRenderer: 'highlightAssigneeCellRenderer'
	},
	{
		headerName: '발명자',
		field: '발명자1',
		width: 100
		// cellRenderer: 'highlightInventorCellRenderer'
	},
	{
		headerName: 'IPC',
		field: 'ipc요약',
		width: 75
	}
];

const localeText = {
	// for filter panel
	page: '페이지',
	more: 'More',
	to: '~',
	of: 'of',
	next: '다음',
	last: '마지막',
	first: '처음',
	previous: '이전',
	loadingOoo: '불러오는 중...',

	filterOoo: '필터...',
	equals: '일치',
	notEqual: '불일치',

	// for number filter
	lessThan: '미만',
	greaterThan: '초과',
	lessThanOrEqual: '이하',
	greaterThanOrEqual: '이상',

	// for text filter
	contains: '포함',
	notContains: '포함하지 않음',
	startsWith: '~로 시작',
	endsWith: '~로 끝',

	// other
	noRowsToShow: '결과 값이 없습니다.'
};

const colsList = [
	{
		id: '1',
		name: '출원번호',
		field: '출원번호'
	},
	{
		id: '2',
		name: '출원일',
		field: '출원일자'
	},
	{
		id: '3',
		name: '상태',
		field: '등록사항'
	},
	{
		id: '4',
		name: '국문명칭',
		field: '발명의명칭(국문)'
	},
	{
		id: '5',
		name: '영문명칭',
		field: '발명의명칭(영문)'
	},
	{
		id: '6',
		name: '출원인',
		field: '출원인1'
	},
	{
		id: '7',
		name: '발명자',
		field: '발명자1'
	},
	{
		id: '8',
		name: 'IPC',
		field: 'ipc요약'
	}
];

const TurnOffHightlight = true;

function ContentGrid(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const cols = useSelector(({ searchApp }) => searchApp.searchs.cols);
	const [rowsCount, setRowsCount] = useState(searchs.length);
	const [data, setData] = useState(searchs);

	const handleOnChange = useDebounce(cols => {
		dispatch(Actions.updateCols(cols));
	}, 300);

	const highlightWords = searchParams.terms.flatMap(x => x.toString().split(' ').join(',').split(','));

	const frameworkComponents = {
		highlightCellRenderer: HighlightCellRenderer,
		highlightAssigneeCellRenderer: HighlightAssigneeCellRenderer,
		highlightInventorCellRenderer: HighlightInventorCellRenderer
	};
	// https://github.com/ag-grid/ag-grid/issues/839
	function HighlightCellRenderer({ value }) {
		return <Highlighter searchWords={[].concat(...highlightWords)} autoEscape textToHighlight={value} />;
	}
	// https://stackoverflow.com/questions/14824283/convert-a-2d-javascript-array-to-a-1d-array
	function HighlightAssigneeCellRenderer({ value }) {
		return (
			<Highlighter
				searchWords={[].concat(...highlightWords, ...searchParams.assignee)}
				autoEscape
				textToHighlight={value}
			/>
		);
	}
	function HighlightInventorCellRenderer({ value }) {
		return (
			<Highlighter
				searchWords={[].concat(...highlightWords, ...searchParams.inventor)}
				autoEscape
				textToHighlight={value}
			/>
		);
	}
	let gridApi;
	// let gridColumnApi;
	const onGridReady = params => {
		gridApi = params.api;
		// gridColumnApi = params.columnApi;
		// params.api.setDatasource(dataSource);
		const updateData = data => {
			var idSequence = 1;
			data.forEach(function (item) {
				item.id = idSequence++;
			});
			var fakeServer = new FakeServer(data);
			var datasource = ServerSideDatasource(fakeServer);
			params.api.setServerSideDatasource(datasource);
		};
		if (searchs) {
			setRowsCount(searchs.length);
			updateData(searchs);
		}
	};

	function ServerSideDatasource(server) {
		return {
			getRows: function (params) {
				// console.log('[Datasource] - rows requested by grid: ', params.request);
				var response = server.getData(params.request);
				setTimeout(function () {
					if (response.success) {
						params.successCallback(response.rows, response.lastRow);
					} else {
						params.failCallback();
					}
				}, 200);
			}
		};
	}

	function onBtExport() {
		// var params = getParams();
		// console.log("onBtExport -> params", params);

		var params = {
			columnKeys: colsList.filter(el => cols.includes(el.id)).map(cls => cls.field),
			suppressQuotes: undefined,
			columnSeparator: undefined,
			customHeader: undefined,
			customFooter: undefined
		};
		// params.columnKeys = colsList.filter((el) => cols.includes(el.id)).map(cls => cls.field);
		// console.log("onBtExport -> params.columnKeys", params.columnKeys)

		gridApi.exportDataAsCsv(params);
	}

	// function onFirstDataRendered({ columnApi }) {
	//     var allColumnIds = [];
	//     columnApi.getAllColumns().forEach(function(column) {
	//         allColumnIds.push(column.colId);
	//     });
	//     columnApi.autoSizeColumns(allColumnIds);
	// }

	// useEffect(() => {
	//     refreshCells(params)
	// }, [searchs, searchText]);

	useEffect(() => {
		function addSeparator(val, separator, p1, p2) {
			return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
		}
		if (searchs && searchs.length > 0) {
			setData(
				searchs.map(el =>
					el.출원번호 || el.출원일자 || el['발명의명칭(국문)']
						? {
								...el,
								출원번호: addSeparator(el.출원번호, '-', 2, 6),
								출원일자: addSeparator(el.출원일자, '.', 4, 6)
						  }
						: { ...el }
				)
			);
		} else {
			setData(searchs);
		}
	}, [searchs, searchParams]);

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col flex-1 items-center justify-start w-full h-3/4">
				<Typography variant="h6" className="my-24" color="primary">
					Loading ...
				</Typography>
				<CircularProgress size={24} />
			</div>
		);
	}

	function onRowSelected(event) {
		if (event.node.selected) {
			// dispatch(
			//     Actions.getSearch(
			//         String(event.node.data.출원번호).replace(/-/gi, "")
			//     )
			// );
			props.history.push(`/apps/search/${event.node.data.출원번호}`); // + '/' + item.handle);
		}

		// window.alert(
		//     "row " +
		//         event.node.data.출원번호 +
		//         " selected = " +
		//         event.node.selected
		// );
	}
	// function onSelectionChanged(event) {
	//     var rowCount = event.api.getSelectedNodes().length;
	//     window.alert("selection changed, " + rowCount + " rows selected");
	// }

	// let gridApi;

	// const onButtonClick = e => {
	//     const selectedNodes = gridApi.getSelectedNodes();
	//     const selectedData = selectedNodes.map(node => node.data);
	//     const selectedDataStringPresentation = selectedData
	//         .map(node => node.make + " " + node.model)
	//         .join(", ");
	//     alert(`Selected nodes: ${selectedDataStringPresentation}`);
	// };

	return (
		<div className={classes.root}>
			<Paper className="rounded-8 shadow h-full w-full p-8 pb-76">
				{/* <div className={ag-theme-alpine${classes.darkGrid}`, 'h-full w-full')}> */}
				<div className="ag-theme-alpine h-full w-full">
					{/* <Button onClick={onButtonClick}>Get selected rows</Button> */}
					<div className="flex items-center justify-between">
						<div className="p-12 flex items-center">
							<Typography variant="h6">검색 결과 ({Number(rowsCount).toLocaleString()})</Typography>
						</div>
						<div className="flex items-center justify-end">
							<Button
								variant="outlined"
								color="default"
								onClick={onBtExport}
								className="shadow-none px-16"
								startIcon={<SaveAltIcon />}
							>
								다운로드
							</Button>
							<Tooltip title="다운로드 항목설정" placement="bottom">
								<div>
									<DownloadFilterMenu cols={cols} colsList={colsList} onChange={handleOnChange} />
								</div>
							</Tooltip>
						</div>
					</div>
					<AgGridReact
						// modules={AllModules}
						columnDefs={columnDefs}
						// rowData={data}
						rowModelType="serverSide" //"infinite"
						rowSelection="multiple"
						// checkboxSelection={false}
						// onGridReady={params => (gridApi = params.api)}
						onGridReady={onGridReady}
						// onPaginationChanged={onPaginationChanged}
						// animateRows
						// setting default column properties
						defaultColDef={{
							sortable: true,
							filter: true,
							resizable: true
							// headerComponentFramework: SortableHeaderComponent,
							// headerComponentParams: {
							//     menuIcon: "fa-bars"
							// }
						}}
						pagination={true}
						paginationPageSize={50}
						paginationAutoPageSize={true}
						cacheBlockSize={50}
						rowHeight={40}
						// sideBar={{
						// 	toolPanels: ['columns', 'filters']
						// }}
						onRowSelected={onRowSelected}
						// onPaginationChanged={onPaginationChanged}
						// onSelectionChanged={onSelectionChanged.bind(this)}
						// onFirstDataRendered={onFirstDataRendered}
						frameworkComponents={TurnOffHightlight ? '' : frameworkComponents}
						reactNext
						enableCellChangeFlash
						localeText={localeText}
						// icons={{
						// 	first: '<span><</span>',
						// 	previous: '<span><<</span>',
						// 	next: '<span>></span>',
						// 	last: '<span>>></span>'
						// }}
					/>
				</div>
			</Paper>
		</div>
	);
}
export default withRouter(ContentGrid);
