import React, { useEffect, useState } from 'react';
import MaterialTable, { MTableToolbar, dense } from 'material-table';
import Chip from '@material-ui/core/Chip';
// import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FuseUtils from '@fuse/utils/FuseUtils';
// import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';

import { useSelector } from 'react-redux';
// import _ from '@lodash';
// import * as Actions from '../../store/actions';

const useStyles = makeStyles(theme => ({
	chip: {
		margin: theme.spacing(1)
	}
}));

// function handleToggleChip(event, id, props) {
// 	event.stopPropagation();
// 	console.log(id);
// 	console.log(props);
// 	// this.setState({
// 	//     props.selectedRows : this.state.props.selectedRows.filter((_, i) => i !== id)
// 	//   });
// 	// setForm(
// 	//     _.set({
// 	//         ...form,
// 	//         labels: form.labels.includes(id)
// 	//             ? form.labels.filter(labelId => labelId !== id)
// 	//             : [...form.labels, id]
// 	//     })
// 	// );
// }

// removeItem(index) {
//     this.setState({
//       data: this.state.data.filter((_, i) => i !== index)
//     });
//   }

function ToolbarChip(props) {
	const classes = useStyles();
	// const dispatch = useDispatch();

	// console.log(props);
	// console.log(props.selectedRows);

	function handleChipDelete(event, id) {
		event.stopPropagation();
		// console.log(event);
		console.log(id);
		console.log(props.selectedRows);
		const selectedApplicant = props.selectedRows.filter(특허고객대표번호 => 특허고객대표번호 !== id);
		console.log(selectedApplicant);
		// this.setState({
		//     props.selectedRows : this.state.props.selectedRows.filter((_, i) => i !== id)
		//   });
		// setForm(
		//     _.set({
		//         ...form,
		//         labels: form.labels.includes(id)
		//             ? form.labels.filter(labelId => labelId !== id)
		//             : [...form.labels, id]
		//     })
		// );
	}

	return (
		<FuseScrollbars className="flex flex-auto w-full max-h-96">
			<div
				className={clsx(props.selectedRows.length > 0 ? '' : 'hidden', 'flex flex-wrap  px-16 sm:px-24 mb-16')}
			>
				{props.selectedRows.map(n => (
					<Chip
						label={n.특허고객대표번호}
						// label={_.find(props.data, { id: label }).출원인대표명}
						// onDelete={ev =>
						//     props.selectedRows.filter(
						//         특허고객대표번호 =>
						//             특허고객대표번호 !== n.특허고객대표번호
						//     )
						// }
						// onDelete={ev => handleToggleLabel(ev, n.특허고객대표번호)}
						onDelete={ev => handleChipDelete(ev, n.특허고객대표번호)}
						// onDelete={ev =>
						//     handleToggleChip(ev, n.특허고객대표번호, props)
						// }
						// onDelete= {(evt, data) => alert('You want to delete ' + data.length + ' rows')}
						className={classes.chip}
						// className="mr-8 my-8"
						// classes={{ label: "pl-4" }}
						key={n.특허고객대표번호}
					/>
				))}
			</div>
		</FuseScrollbars>
	);
}

function ApplicantMTable(props) {
	// const dispatch = useDispatch();
	const applicants = useSelector(({ searchApp }) => searchApp.applicant.entities);
	const searchText = useSelector(({ searchApp }) => searchApp.applicant.searchText);

	// const selectedApplicantIds = useSelector(({ searchApp }) => searchApp.applicant.selectedApplicantIds);

	// useEffect(() => {
	//     // dispatch(Actions.getApplicantTable());
	// }, [dispatch]);

	const [filteredData, setFilteredData] = useState(applicants);

	useEffect(() => {
		function getFilteredArray(entities, searchText) {
			const arr = Object.keys(entities).map(출원인명 => entities[출원인명]);
			// if (searchText.length === 0) {
			if (!searchText || searchText.length === 0) {
				return arr;
			}
			return FuseUtils.filterArrayByString(arr, searchText);
		}

		if (applicants) {
			setFilteredData(getFilteredArray(applicants, searchText));
		}
	}, [applicants, searchText]);

	if (!filteredData) {
		return null;
	}

	if (filteredData.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center h-full pb-5">
				<Typography color="textSecondary" variant="h6">
					검색 결과가 없습니다!
				</Typography>
			</div>
		);
	}

	// useEffect(() => {
	//     setFilteredData(
	//         searchText.length === 0
	//             ? applicants
	//             : _.filter(
	//                   applicants,
	//                   item =>
	//                       //   item.name.toLowerCase().includes(searchText.toLowerCase())
	//                       item.출원인명
	//                   //   .toLowerCase()
	//                   //   .includes(searchText.toLowerCase())
	//               )
	//     );
	// }, [applicants, searchText]);

	// const [selected, setSelected] = useState([]);

	// const [chipSelected, setChipSelected] = useState([]);

	// const tableRef = React.useRef(null);
	// const handleReset = () => {
	//     tableRef.current.value = "";
	// };
	// function handleSelectAllClick(event) {
	//     if (event.target.checked) {
	//         // setSelected(data.map(n => n.id));
	//         setSelected(data.map(n => n.특허고객대표번호));
	//         return;
	//     }
	//     setSelected([]);
	// }

	// function handleClear(event) {
	//     event.stopPropagation();
	//     // setSelected([]);
	//     setChipSelected([]);
	// }
	// function handleApply(event) {
	//     event.stopPropagation();
	//     // setSelected([]);
	//     setChipSelected([]);
	// }

	return (
		<MaterialTable
			// tableRef={tableRef}
			title="대표명을 선택해주세요..."
			columns={[
				// { title: "특허고객번호", field: "특허고객번호" },
				// { title: "출원인명", field: "출원인명" },
				{ title: '특허고객대표번호', field: '특허고객대표번호' },
				{ title: '출원인대표명', field: '출원인대표명' }, // , removable: false },
				{ title: '출원인영문대표명', field: '출원인영문대표명' } // , type: "numeric" },
			]}
			data={filteredData}
			options={{
				// cellstyle: {
				//     width: "10px",
				//     maxWidth: "32em",
				//     textOverflow: "inherit",
				//     overflow: "scroll",
				//     whiteSpace: "nowrap"
				// },
				// style: { whiteSpace: "unset" },
				// rowStyle: {
				//     whiteSpace: "unset"
				// },
				selection: true,
				padding: dense,
				pageSize: 10,
				pageSizeOptions: [10, 25, 50, 100]
			}}
			actions={[
				// https://github.com/mbrn/material-table/issues/657
				// rowData => ({
				//     icon: () => (
				//         <Button
				//             onClick={event =>
				//                 props.action.onClick(event, props.data)
				//             }
				//             color="primary"
				//             variant="contained"
				//             style={{ textTransform: "none" }}
				//             size="small"
				//         >
				//             검색식 적용
				//         </Button>
				//     )
				// }),
				// rowData => ({
				//     icon: () => (
				//         <Button
				//             onClick={event =>
				//                 props.action.onClick(event, props.data)
				//             }
				//             color="secondary"
				//             variant="outline"
				//             style={{ textTransform: "none" }}
				//             size="small"
				//         >
				//             초기화
				//         </Button>
				//     )
				// }),
				rowData => ({
					// icon: () => (
					//     <Button
					//         // onClick={ev => handleClear(ev)}
					//         // color="primary"
					//         variant="outlined"
					//         style={{ textTransform: "none" }}
					//         size="small"
					//     >
					//         초기화
					//     </Button>
					// ),
					// onClick: { handleReset }
					// onClick: (evt, d) => {
					// state.data.forEach(d => {
					//     if (d.tableData) d.tableData.checked = false;
					// });
					// }
					icon: 'delete',
					onClick: (evt, filteredData) => {
						// console.log(evt);
						// console.log(data);
						// console.log(props);
						// console.log(tableRef);
						// console.log(this.state);
						let i;
						for (i = filteredData.length - 1; i >= 0; i--) {
							const index = filteredData[i].tableData.id;
							filteredData[i].tableData.checked = false;
							// this.state.alldata.splice(index, 1);
							filteredData.splice(index, 1);
						}
						// tableRef.current && tableRef.current.onQueryChange();
						// console.log(evt);
						console.log(filteredData);
						console.log(applicants);
						// console.log(props);
					}
				}),
				rowData => ({
					icon: 'reset',
					// icon: () => (
					//         <Button
					//             // onClick={ev => handleClear(ev)}
					//             // color="primary"
					//             variant="outlined"
					//             style={{ textTransform: "none" }}
					//             size="small"
					//         >
					//             초기화
					//         </Button>
					// ),
					// onClick: { handleReset }
					// onClick: (evt, d) => {
					// state.data.forEach(d => {
					//     if (d.tableData) d.tableData.checked = false;
					// });
					// }
					onClick: (evt, filteredData) => {
						// console.log(evt);
						// console.log(data);
						// console.log(props);
						// console.log(tableRef);
						// console.log(this.state);
						let i;
						for (i = filteredData.length - 1; i >= 0; i--) {
							const index = filteredData[i].tableData.id;
							filteredData[i].tableData.checked = false;
							// this.state.alldata.splice(index, 1);
							filteredData.splice(index, 1);
						}
						// tableRef.current && tableRef.current.onQueryChange();
						// console.log(evt);
						console.log(filteredData);
						console.log(applicants);
						// console.log(props);
					}

					// tooltip: "Refresh Data",
					// isFreeAction: true
					// onClick: () =>
					//     this.tableRef.current &&
					//     this.tableRef.current.onQueryChange()
				})
				// rowData => ({
				//     icon: "apply"
				//     // icon: () => (
				//     //     <Button
				//     //         onClick={ev => handleApply(ev)}
				//     //         color="secondary"
				//     //         variant="contained"
				//     //         style={{ textTransform: "none" }}
				//     //         size="small"
				//     //     >
				//     //         검색식 적용
				//     //     </Button>
				//     // )
				//     // tooltip: "Refresh Data",
				//     // isFreeAction: true
				//     // onClick: () =>
				//     //     this.tableRef.current &&
				//     //     this.tableRef.current.onQueryChange()
				// })
			]}
			// other props
			localization={{
				pagination: {
					labelDisplayedRows: '{from}-{to} 중 {count}',
					labelRowsSelect: '열',
					labelRowsPerPage: '페이지 당 열',
					firstAriaLabel: '첫 페이지',
					firstTooltip: '첫 페이지',
					previousAriaLabel: '이전 페이지',
					previousTooltip: '이전 페이지',
					nextAriaLabel: '다음 페이지',
					nextTooltip: '다음 페이지',
					lastAriaLabel: '마지막 페이지',
					lastTooltip: '마지막 페이지'
				},
				toolbar: {
					nRowsSelected: '{0} 건 선택' // "{0} row(s) selected"
				},
				header: {
					actions: 'Actions'
				},
				body: {
					emptyDataSourceMessage: '표시할 레코드가 없습니다.', // "No records to display",
					filterRow: {
						filterTooltip: '필터' // "Filter"
					}
				}
			}}
			components={{
				// Action: props => (
				//     <Button
				//         onClick={event =>
				//             props.action.onClick(event, props.data)
				//         }
				//         color="primary"
				//         variant="contained"
				//         style={{ textTransform: "none" }}
				//         size="small"
				//     >
				//         초기화
				//     </Button>
				// ),
				// Toolbar: props => <MTableToolbar {...props} />
				Toolbar: props => (
					<div>
						<MTableToolbar {...props} />
						<ToolbarChip {...props} />
						{/* <div style={{ padding: "0px 10px" }}>
                            <Chip
                                label="Chip 1"
                                color="secondary"
                                style={{ marginRight: 5 }}
                            />
                            <Chip
                                label="Chip 2"
                                color="secondary"
                                style={{ marginRight: 5 }}
                            />
                            <Chip
                                label="Chip 3"
                                color="secondary"
                                style={{ marginRight: 5 }}
                            />
                            <Chip
                                label="Chip 4"
                                color="secondary"
                                style={{ marginRight: 5 }}
                            />
                            <Chip
                                label="Chip 5"
                                color="secondary"
                                style={{ marginRight: 5 }}
                            />
                        </div> */}
					</div>
				)
			}}

			// parentChildData={(row, rows) =>
			//     rows.find(a => a.특허고객번호 === row.특허고객대표번호)
			// }

			// onSelectionChange={rows =>
			//     alert("You selected " + rows.length + " rows")
			// }
		/>
	);
}

export default withRouter(ApplicantMTable);
