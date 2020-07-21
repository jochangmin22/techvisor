import React, { useEffect, useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import FuseUtils from '@fuse/utils/FuseUtils';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { useDispatch, useSelector } from 'react-redux';
import ReactTable from 'react-table';
import clsx from 'clsx';
import * as Actions from '../../store/actions';
// import ContactsMultiSelectMenu from "./ContactsMultiSelectMenu";

const useStyles = makeStyles(theme => ({
	chip: {
		margin: theme.spacing(1)
	}
}));

function ToolbarChip(props) {
	const dispatch = useDispatch();
	const classes = useStyles();

	const selectedApplicantIds = useSelector(({ searchApp }) => searchApp.applicant.selectedApplicantIds);

	// console.log(props);
	return (
		<FuseScrollbars className="flex flex-auto w-full max-h-96">
			<div
				className={clsx(
					// selectedApplicantIds.length > 0 ? "" : "hidden",
					selectedApplicantIds ? '' : 'hidden',
					'flex flex-wrap  px-16 sm:px-24 mb-16'
				)}
			>
				{selectedApplicantIds.map(n => (
					<Chip
						label={n}
						// label={_.find(props.data, { id: label }).출원인대표명}
						// onDelete={ev => handleToggleLabel(ev, n.특허고객대표번호)}
						// onDelete={ev => handleToggleChip(ev, n, props)}
						onDelete={ev => dispatch(toggleInSelectedApplicants(n))}
						// onDelete= {(evt, data) => alert('You want to delete ' + data.length + ' rows')}
						className={classes.chip}
						// className="mr-8 my-8"
						// classes={{ label: "pl-4" }}
						key={n}
					/>
				))}
			</div>
		</FuseScrollbars>
	);
}

function ApplicantRTable(props) {
	const dispatch = useDispatch();
	// const contacts = useSelector(
	//     ({ contactsApp }) => contactsApp.contacts.entities
	// );
	// const selectedApplicantIds = useSelector(
	//     ({ contactsApp }) => contactsApp.contacts.selectedApplicantIds
	// );
	// const searchText = useSelector(
	//     ({ contactsApp }) => contactsApp.contacts.searchText
	// );
	// const user = useSelector(({ contactsApp }) => contactsApp.user);

	// const {
	//     getTableProps,
	//     headerGroups,
	//     rows,
	//     prepareRow,
	//     state: [{ selectedRows }]
	// } = useTable(
	//     {
	//         columns,
	//         data
	//     },
	//     useRowSelect
	// );

	const applicants = useSelector(({ searchApp }) => searchApp.applicant.entities);
	const searchText = useSelector(({ searchApp }) => searchApp.applicant.searchText);

	const selectedApplicantIds = useSelector(({ searchApp }) => searchApp.applicant.selectedApplicantIds);

	const [filteredData, setFilteredData] = useState(null);

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

	return (
		<div className="flex flex-col flex-auto flex-shrink-0 w-full">
			<FuseAnimate animation="transition.slideUpIn" duration={400} delay={100}>
				{/* <div /> */}
				<ToolbarChip {...props} />
			</FuseAnimate>

			<FuseAnimate animation="transition.slideUpIn" delay={300}>
				<ReactTable
					className="-striped -highlight h-full sm:rounded-16 overflow-hidden"
					getTrProps={(state, rowInfo, column) => {
						return {
							className: 'cursor-pointer',
							onClick: (e, handleOriginal) => {
								if (rowInfo) {
									// dispatch(
									//     Actions.openEditContactDialog(
									//         rowInfo.original
									//     )
									// );
								}
							}
						};
					}}
					getTdProps={(state, rowInfo, column) => {
						return {
							style: {
								padding: '0px 5px' // background: rowInfo.row.age > 20 ? 'green' : 'red'
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
											? dispatch(selectAllApplicants())
											: dispatch(deSelectAllApplicants());
									}}
									checked={
										selectedApplicantIds.length === Object.keys(filteredData).length &&
										selectedApplicantIds.length > 0
									}
									indeterminate={
										selectedApplicantIds.length !== Object.keys(filteredData).length &&
										selectedApplicantIds.length > 0
									}
									// checked={
									//     selectedApplicantIds.length ===
									//         Object.keys(applicants).length &&
									//     selectedApplicantIds.length > 0
									// }
									// indeterminate={
									//     selectedApplicantIds.length !==
									//         Object.keys(applicants).length &&
									//     selectedApplicantIds.length > 0
									// }
								/>
							),
							accessor: '',
							Cell: row => {
								return (
									<Checkbox
										onClick={event => {
											event.stopPropagation();
										}}
										checked={selectedApplicantIds.includes(
											// row.value.id
											row.value.특허고객번호
										)}
										onChange={() =>
											dispatch(
												Actions.toggleInSelectedApplicants(
													// row.value.id
													row.value.특허고객번호
												)
											)
										}
									/>
								);
							},
							className: 'justify-center',
							sortable: false,
							width: 64
						},
						{
							Header: () =>
								selectedApplicantIds.length > 0 && (
									<div />
									// <ContactsMultiSelectMenu />
								),
							accessor: 'avatar',
							// Cell: row => (
							//     <Avatar
							//         className="mr-8"
							//         alt={row.original.name}
							//         src={row.value}
							//     />
							// ),
							className: 'justify-center',
							width: 64,
							sortable: false
						},
						// {
						//     Header: "특허고객번호",
						//     accessor: "특허고객번호",
						//     filterable: true
						// },
						// {
						//     Header: "출원인명",
						//     accessor: "출원인명",
						//     filterable: true
						// },
						{
							Header: '특허고객대표번호',
							accessor: '특허고객대표번호',
							filterable: true,
							className: 'font-bold'
						},
						{
							Header: '출원인대표명',
							accessor: '출원인대표명',
							filterable: true,
							className: 'font-bold'
						},
						{
							Header: '출원인영문대표명',
							accessor: '출원인영문대표명',
							filterable: true
						}
					]}
					defaultPageSize={10}
					minRows={0}
					// Text
					previousText="이전"
					nextText="다음"
					loadingText="불러오는 중..."
					noDataText="데이터가 없습니다."
					pageText="페이지"
					ofText="중"
					rowsText="열"
					// noDataText="No contacts found"
					SubComponent={row => {
						return <div style={{ padding: '20px' }}>Another Sub Component!</div>;
					}}
				/>
			</FuseAnimate>
		</div>
	);
}

export default ApplicantRTable;
