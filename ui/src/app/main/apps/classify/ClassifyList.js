import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
// import _ from "@lodash";
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector } from 'react-redux';
// import ReactTable from "react-table";
// import * as Actions from "./store/actions";
// import ClassifyMultiSelectMenu from "./ClassifyMultiSelectMenu";
import HotCustomRenderer from './inc/HotCustomRenderer';
import { HotTable, HotColumn } from '@handsontable/react';
// import Handsontable from "handsontable";

function ClassifyList(props) {
	// const dispatch = useDispatch();
	const entities = useSelector(({ classifyApp }) => classifyApp.classify.entities);
	const dictionaries = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.dictionaries);
	// const selectedClassifyIds = useSelector(
	//     ({ classifyApp }) => classifyApp.classify.selectedClassifyIds
	// );
	// const searchText = useSelector(
	//     ({ classifyApp }) => classifyApp.classify.searchText
	// );
	// const user = useSelector(({ classifyApp }) => classifyApp.user);

	// const [filteredData, setFilteredData] = useState(null);
	const [initialHeaders, setInitialHeaders] = useState();
	const [initialState, setInitialState] = useState(null);

	useEffect(() => {
		if (dictionaries) {
			setInitialHeaders(['출원번호', ...dictionaries.map(dictionary => dictionary.산업명)]);
		}
	}, [dictionaries]);

	useEffect(() => {
		function getRow(dictonaries, entityIpc) {
			const rowState = dictionaries.map(dictionary => {
				let ipc_array = dictionary['특허분류(IPC)'].replace(/ *\([^)]*\) */g, '').split(',');
				let isMatched = ipc_array.find(ipc => ipc.trim().substring(0, 4) === entityIpc);
				return isMatched ? '1' : '0';
			});
			return rowState;
		}

		if (entities && dictionaries && entities.length > 0 && dictionaries.length > 0) {
			setInitialState(
				entities.map(entity => {
					return [entity.출원번호, ...getRow(dictionaries, entity.ipc요약)];
				})
			);
		}
	}, [entities, dictionaries]);

	if (!dictionaries) {
		return null;
	}

	if (dictionaries.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center h-full">
				<Typography color="textSecondary" variant="h5">
					There are no classify!
				</Typography>
			</div>
		);
	}

	return (
		initialState &&
		initialState.length > 0 &&
		initialHeaders &&
		initialHeaders.length > 0 && (
			<FuseAnimate animation="transition.slideUpIn" delay={300}>
				<HotTable
					id="hot"
					data={initialState}
					colHeaders={initialHeaders}
					rowHeaders={true}
					// nestedHeaders={initialHeaders}
					colWidths={[150, ...initialHeaders.map(k => 80)]}
					width={1280}
					height={400}
					rowHeights={23}
					manualColumnResize={true}
					manualRowResize={true}
					fixedColumnsLeft={1}
					// columnSummary={function() {
					//     var configArray = [];
					//     initialHeaders.map(
					//         (k, i) =>
					//             i > 0 &&
					//             configArray.push({
					//                 sourceColumn: i,
					//                 destinationRow: 0,
					//                 destinationColumn: i,
					//                 type: "sum",
					//                 forceNumeric: true
					//             })
					//     );
					//     return configArray;
					// }}
					licenseKey="non-commercial-and-evaluation"
				>
					<HotColumn key={0} />
					{initialHeaders.map(
						(k, i) =>
							i > 0 && (
								<HotColumn key={i}>
									<HotCustomRenderer hot-renderer />
								</HotColumn>
							)
					)}
				</HotTable>
				{/* <ReactTable
                className="-striped -highlight h-full sm:rounded-16 overflow-hidden"
                getTrProps={(state, rowInfo, column) => {
                    return {
                        className: "cursor-pointer",
                        onClick: (e, handleOriginal) => {
                            if (rowInfo) {
                                dispatch(
                                    Actions.openEditClassifyDialog(
                                        rowInfo.original
                                    )
                                );
                            }
                        }
                    };
                }}
                data={filteredData}
                columns={[
                    {
                        Header: () => (
                            <Checkbox
                                onClick={event => {
                                    event.stopPropagation();
                                }}
                                onChange={event => {
                                    event.target.checked
                                        ? dispatch(Actions.selectAllClassify())
                                        : dispatch(
                                              Actions.deSelectAllClassify()
                                          );
                                }}
                                checked={
                                    selectedClassifyIds.length ===
                                        Object.keys(classify).length &&
                                    selectedClassifyIds.length > 0
                                }
                                indeterminate={
                                    selectedClassifyIds.length !==
                                        Object.keys(classify).length &&
                                    selectedClassifyIds.length > 0
                                }
                            />
                        ),
                        accessor: "",
                        Cell: row => {
                            return (
                                <Checkbox
                                    onClick={event => {
                                        event.stopPropagation();
                                    }}
                                    checked={selectedClassifyIds.includes(
                                        row.value.id
                                    )}
                                    onChange={() =>
                                        dispatch(
                                            Actions.toggleInSelectedClassify(
                                                row.value.id
                                            )
                                        )
                                    }
                                />
                            );
                        },
                        className: "justify-center",
                        sortable: false,
                        width: 64
                    },
                    {
                        Header: () =>
                            selectedClassifyIds.length > 0 && (
                                <ClassifyMultiSelectMenu />
                            ),
                        accessor: "avatar",
                        Cell: row => (
                            <Avatar
                                className="mr-8"
                                alt={row.original.name}
                                src={row.value}
                            />
                        ),
                        className: "justify-center",
                        width: 64,
                        sortable: false
                    },
                    {
                        Header: "First Name",
                        accessor: "name",
                        filterable: true,
                        className: "font-bold"
                    },
                    {
                        Header: "Last Name",
                        accessor: "lastName",
                        filterable: true,
                        className: "font-bold"
                    },
                    {
                        Header: "Company",
                        accessor: "company",
                        filterable: true
                    },
                    {
                        Header: "Job Title",
                        accessor: "jobTitle",
                        filterable: true
                    },
                    {
                        Header: "Email",
                        accessor: "email",
                        filterable: true
                    },
                    {
                        Header: "Phone",
                        accessor: "phone",
                        filterable: true
                    },
                    {
                        Header: "",
                        width: 128,
                        Cell: row => (
                            <div className="flex items-center">
                                <IconButton
                                    onClick={ev => {
                                        ev.stopPropagation();
                                        dispatch(
                                            Actions.toggleStarredClassify(
                                                row.original.id
                                            )
                                        );
                                    }}
                                >
                                    {user.starred &&
                                    user.starred.includes(row.original.id) ? (
                                        <Icon>star</Icon>
                                    ) : (
                                        <Icon>star_border</Icon>
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={ev => {
                                        ev.stopPropagation();
                                        dispatch(
                                            Actions.removeClassify(
                                                row.original.id
                                            )
                                        );
                                    }}
                                >
                                    <Icon>delete</Icon>
                                </IconButton>
                            </div>
                        )
                    }
                ]}
                defaultPageSize={10}
                noDataText="No classify found"
            /> */}
			</FuseAnimate>
		)
	);
}

export default ClassifyList;
