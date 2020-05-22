// eslint-disable
import React, { useState } from 'react';
import { DataGrid, GridColumn, CheckBox } from 'rc-easyui';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
// import { Checkbox } from "@material-ui/core";
// import { createMuiTheme } from "@material-ui/core/styles";
// import { ThemeProvider } from '@material-ui/core/styles';

// const themeGrid = createMuiTheme({
//     overrides: {
//         PrivateSwitchBase: {
//             root: {
//                 padding: "4px"
//             }
//         },
//         MuiSvgIcon: {
//             root: {
//                 fontSize: "2rem"
//             }
//         }
//     }
// });

// TODO : exportToCsv
// TODO : 맨위에 줄 통계
// TODO : 맨밑에 줄 합계
// TODO : conditional style

const dataGridOptions = {
	pageSize: 10,
	pageOptions: {
		layout: ['list', 'sep', 'first', 'prev', 'next', 'last', 'sep', 'refresh', 'sep', 'manual', 'info']
	},
	pagePosition: 'bottom',
	operators: ['nofilter', 'equal', 'notequal', 'less', 'greater'],
	status: [
		{ value: null, text: 'All' },
		{ value: 'P', text: 'P' },
		{ value: 'N', text: 'N' }
	]
};

function HeaderGrid(props) {
	// const data = useMemo(() => props.data, [props.data]);
	const [data, setData] = useState(props.data);
	const [allChecked, setAllChecked] = useState(false);
	const [rowClicked, setRowClicked] = useState(false);

	function handleRowCheck(row, checked) {
		const newData = data.slice();
		const index = data.indexOf(row);
		newData.splice(index, 1, { ...row, selected: checked });
		// console.log(newData);
		const checkedRows = newData.filter(row => row.selected);
		setAllChecked(newData.length === checkedRows.length);
		setRowClicked(true);
		setData(newData);
		// console.log(data);
		setRowClicked(false);
	}
	function handleAllCheck(checked) {
		// console.log(checked);
		if (rowClicked) {
			return;
		}
		const newData = data.map(row => {
			return { ...row, selected: checked };
		});
		// console.log(newData);
		setData(newData);
		setAllChecked(checked);
	}
	const checkedItems = data.filter(row => row.selected).map(row => row.출원번호);
	return (
		<FuseAnimateGroup
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
			className="flex flex-wrap"
		>
			{/* <ThemeProvider theme={themeGrid}> */}
			<DataGrid
				filterable
				data={data}
				rowCss={{ height: '15px' }}
				style={{ height: 210 }}
				pagination
				// lazy
				{...dataGridOptions}
				allChecked={allChecked}
				rowClicked={rowClicked}
				total={data.length}
			>
				<GridColumn
					width={50}
					align="center"
					field="ck"
					render={({ row }) => (
						<CheckBox checked={row.selected} onChange={checked => handleRowCheck(row, checked)} />
					)}
					header={() => <CheckBox checked={allChecked} onChange={checked => handleAllCheck(checked)} />}
				/>
				<GridColumn
					field="등록사항"
					title="등록사항"
					// rowCss={{ height: "15px" }}
					// style={{ fontSize: "11px" }}
				/>
				<GridColumn field="ipc요약" title="IPC" />
				<GridColumn field="발명의명칭(국문)" title="명칭" width="40%" />
				<GridColumn field="출원번호" title="출원번호" />
				<GridColumn field="출원일자" title="출원일" filterOperators={dataGridOptions.operators} />
			</DataGrid>
			<p className="text-black">Checked Items: {checkedItems.join(', ')}</p>
			{/* </ThemeProvider> */}
		</FuseAnimateGroup>
	);
}

export default HeaderGrid;
