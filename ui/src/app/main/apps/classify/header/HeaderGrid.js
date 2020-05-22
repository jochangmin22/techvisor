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
	const [state, setState] = useState({
		allChecked: false,
		rowClicked: false,
		data: props.data
	});

	const handleRowCheck = (row, checked) => {
		let newData = state.data.slice();
		let index = state.data.indexOf(row);
		newData.splice(index, 1, Object.assign({}, row, { selected: checked }));
		let checkedRows = newData.filter(row => row.selected);
		if (state.rowClicked) {
			setState({
				allChecked: newData.length === checkedRows.length,
				rowClicked: true,
				data: newData
			});
		}
	};
	const handleAllCheck = checked => {
		if (state.rowClicked) {
			return;
		}
		let newData = state.data.map(row => {
			return Object.assign({}, row, { selected: checked });
		});
		setState({ allChecked: checked, data: newData });
	};

	// const checkedItems = state.data.filter(row => row.selected).map(row => row.출원번호);
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
				data={state.data}
				rowCss={{ height: '15px' }}
				style={{ height: 210 }}
				pagination
				// lazy
				// {...dataGridOptions}
				// allChecked={state.allChecked}
				// rowClicked={state.rowClicked}
				// total={state.data.length}
			>
				<GridColumn
					width={50}
					align="center"
					field="ck"
					render={({ row }) => (
						<CheckBox checked={row.selected} onChange={checked => handleRowCheck(row, checked)}></CheckBox>
					)}
					header={() => (
						<CheckBox checked={state.allChecked} onChange={checked => handleAllCheck(checked)}></CheckBox>
					)}
				/>
				<GridColumn
					field="등록사항"
					title="등록사항"
					// rowCss={{ height: "15px" }}
					// style={{ fontSize: "11px" }}
				></GridColumn>
				<GridColumn field="ipc요약" title="IPC"></GridColumn>
				<GridColumn field="발명의명칭(국문)" title="명칭" width="40%"></GridColumn>
				<GridColumn field="출원번호" title="출원번호"></GridColumn>
				<GridColumn field="출원일자" title="출원일" filterOperators={dataGridOptions.operators}></GridColumn>
			</DataGrid>
			{/* <p className="text-black">
                Checked Items: {checkedItems.join(", ")}
            </p> */}
			{/* </ThemeProvider> */}
		</FuseAnimateGroup>
	);
}

export default HeaderGrid;
