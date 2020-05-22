import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import _ from '@lodash';
import { useDispatch, useSelector } from 'react-redux';
import ApplicantTableHead from './ApplicantTableHead';
// import * as Actions from '../../store/actions';

const useStyles = makeStyles(theme => ({
	chip: {
		margin: theme.spacing(1)
	}
}));

function ApplicantTable(props) {
	// const classes = useStyles();

	const dispatch = useDispatch();
	const results = useSelector(({ searchApp }) => searchApp.applicant.data);
	const searchText = useSelector(({ searchApp }) => searchApp.applicant.searchText);

	const [selected, setSelected] = useState([]);
	const [chipSelected, setChipSelected] = useState([]);
	const [data, setData] = useState(results);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState({
		direction: 'asc',
		id: null
	});

	const filtered = data.filter((value, index) => {
		return selected.includes(index);
	});

	useEffect(() => {
		// dispatch(Actions.getApplicantTable());
	}, [dispatch]);

	useEffect(() => {
		setData(
			searchText.length === 0
				? results
				: _.filter(results, item =>
						//   item.name.toLowerCase().includes(searchText.toLowerCase())
						item.출원인명.toLowerCase().includes(searchText.toLowerCase())
				  )
		);
	}, [results, searchText]);

	function handleRequestSort(event, property) {
		const id = property;
		let direction = 'desc';

		if (order.id === property && order.direction === 'desc') {
			direction = 'asc';
		}

		setOrder({
			direction,
			id
		});
	}

	function handleClear(event) {
		event.stopPropagation();
		setSelected([]);
		setChipSelected([]);
	}
	function handleApply(event) {
		event.stopPropagation();
		setSelected([]);
		setChipSelected([]);
	}
	function handleSelectAllClick(event) {
		if (event.target.checked) {
			setSelected(data.map((n, index) => index));
			setChipSelected(data.map(n => n.특허고객대표번호));
			// setSelected(
			//     data
			//         .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			//         .map(p => p.id)
			// );
			return;
		}
		setSelected([]);
	}

	function handleClick(item) {
		props.history.push(`/apps/search-app/applicant/${item.id}/${item.handle}`);
	}

	function handleCheck(event, id, value) {
		event.stopPropagation();

		const selectedIndex = selected.indexOf(id);

		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);

		// chip
		let newChipSelected = [];

		if (selectedIndex === -1) {
			newChipSelected = newChipSelected.concat(chipSelected, value);
		} else if (selectedIndex === 0) {
			newChipSelected = newChipSelected.concat(chipSelected.slice(1));
		} else if (selectedIndex === chipSelected.length - 1) {
			newChipSelected = newChipSelected.concat(chipSelected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newChipSelected = newChipSelected.concat(
				chipSelected.slice(0, selectedIndex),
				chipSelected.slice(selectedIndex + 1)
			);
		}

		setChipSelected(newChipSelected);
		console.log(selected);
	}

	function handleChangePage(event, page) {
		setPage(page);
	}

	function handleChangeRowsPerPage(event) {
		setRowsPerPage(event.target.value);
	}

	if (!data) {
		return null;
	}

	if (data.length === 0) {
		return <div className="flex flex-1 items-center justify-center min-h-96">표시할 레코드가 없습니다.</div>;
	}

	function handleChip(event, value) {
		event.stopPropagation();

		const selectedChipIndex = chipSelected.indexOf(value);
		let newChipSelected = [];

		if (selectedChipIndex === -1) {
			newChipSelected = newChipSelected.concat(chipSelected, value);
		} else if (selectedChipIndex === 0) {
			newChipSelected = newChipSelected.concat(chipSelected.slice(1));
		} else if (selectedChipIndex === chipSelected.length - 1) {
			newChipSelected = newChipSelected.concat(chipSelected.slice(0, -1));
		} else if (selectedChipIndex > 0) {
			newChipSelected = newChipSelected.concat(
				chipSelected.slice(0, selectedChipIndex),
				chipSelected.slice(selectedChipIndex + 1)
			);
		}

		setChipSelected(newChipSelected);

		// check

		let newSelected = [];

		if (selectedChipIndex === -1) {
			newSelected = newSelected.concat(selected, value);
		} else if (selectedChipIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedChipIndex === chipSelected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedChipIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedChipIndex),
				selected.slice(selectedChipIndex + 1)
			);
		}

		setSelected(newSelected);
		console.log(selected);
	}

	function ToolbarChip() {
		const classes = useStyles();

		return (
			<FuseScrollbars className="flex flex-auto w-full max-h-96">
				<div className={clsx(selected.length > 0 ? '' : 'hidden', 'flex flex-wrap  px-16 sm:px-24 mb-16')}>
					{/* {selected.map(n => ( */}
					{filtered.map(n => (
						// const isSelected = selected.indexOf(index) !== -1;
						<Chip
							label={n.특허고객대표번호}
							// label={_.find(props.data, { id: label }).출원인대표명}
							// onDelete={ev => handleToggleLabel(ev, n.특허고객대표번호)}
							// onDelete={ev =>
							//     handleToggleChip(ev, n.특허고객대표번호, props)
							// }
							onDelete={ev => handleChip(ev, n.특허고객대표번호)}
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

	return (
		<Paper className={clsx('w-full rounded-8 shadow-none border-1')}>
			<div className="flex items-center justify-between px-16 h-64 border-b-1">
				{/* <Typography className="text-16">
                    {props.widget.title}
                </Typography>
                <Typography className="text-11 font-500 rounded-4 text-white bg-blue px-8 py-4">
                    {props.widget.table.rows.length + " Members"}
                </Typography> */}

				<Typography className="text-14">
					<span className="font-800">검색결과</span> 총 <span className="text-blue">{data.length}</span> 건
				</Typography>
				{/* <Typography className="text-12">
                    <span className="font-900">한국</span>{" "}
                    <span className="text-blue">14</span> 건 - 특허공개{" "}
                    <span className="text-blue">5</span> 건{"  "}
                    <span className="text-gray">|</span> 특허공고/등록{" "}
                    <span className="text-blue">9</span> 건{"  "}
                    <span className="text-gray">|</span> 실용공개 0 건{"  "}
                    <span className="text-gray">|</span> 실용등록 0 건 /{" "}
                    <span className="font-900">미국</span>{" "}
                    <span className="text-blue">19</span> 건 - 특허공개{" "}
                    <span className="text-blue">12</span> 건{"  "}
                    <span className="text-gray">|</span> 특허공고/등록{" "}
                    <span className="text-blue">7</span> 건{"  "}
                    <span className="text-gray">|</span> 디자인 0 건{"  "}
                    <span className="text-gray">|</span> 식물 0 건
                </Typography> */}
				{/* <Typography className="text-11 font-500 rounded-4 text-white bg-blue px-8 py-4" /> */}

				<div className="items-center justify-start">
					<Button onClick={ev => handleClear(ev)} className="md:mx-2" variant="outlined" size="small">
						<span className="hidden sm:flex">초기화</span>
						<Icon className="flex sm:hidden" fontSize="small">
							refresh
						</Icon>
					</Button>
					<Button
						className="md:mr-2"
						variant="contained"
						size="small"
						color="secondary"
						onClick={ev => handleApply(ev)}
					>
						<span className="hidden sm:flex">검색식 적용</span>
						<Icon className="flex sm:hidden" fontSize="small">
							check
						</Icon>
					</Button>
				</div>
			</div>
			<ToolbarChip {...props} />
			<div className="table-responsive w-full flex flex-col">
				<FuseScrollbars className="flex-grow overflow-x-auto">
					<Table className="min-w-xl" aria-labelledby="tableTitle" size="small">
						<ApplicantTableHead
							numSelected={selected.length}
							order={order}
							onSelectAllClick={handleSelectAllClick}
							onRequestSort={handleRequestSort}
							rowCount={data.length}
						/>

						<TableBody>
							{_.orderBy(
								data,
								[
									o => {
										switch (order.id) {
											case 'categories': {
												return o.categories[0];
											}
											default: {
												return o[order.id];
											}
										}
									}
								],
								[order.direction]
							)
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((n, index) => {
									const isSelected =
										// selected.indexOf(n.id) !== -1;
										selected.indexOf(index) !== -1;
									return (
										<TableRow
											// className="h-64 cursor-pointer"
											className="cursor-pointer"
											hover
											role="checkbox"
											aria-checked={isSelected}
											tabIndex={-1}
											// key={n.id}
											key={index}
											selected={isSelected}
											onClick={event => handleClick(n)}
										>
											<TableCell className="w-48 px-4 sm:px-12" padding="checkbox">
												<Checkbox
													checked={isSelected}
													onClick={event => event.stopPropagation()}
													onChange={event =>
														// handleCheck(event, n.id)
														handleCheck(event, index, n.특허고객대표번호)
													}
												/>
											</TableCell>

											<TableCell className="w-52" component="th" scope="row" padding="none">
												{n.특허고객번호}
												{/* {n.images.length > 0 &&
                                                n.featuredImageId ? (
                                                    <img
                                                        className="w-full block rounded"
                                                        src={
                                                            _.find(n.images, {
                                                                id:
                                                                    n.featuredImageId
                                                            }).url
                                                        }
                                                        alt={n.name}
                                                    />
                                                ) : (
                                                    <img
                                                        className="w-full block rounded"
                                                        src="assets/images/ecommerce/product-image-placeholder.png"
                                                        alt={n.name}
                                                    />
                                                )} */}
											</TableCell>

											<TableCell component="th" scope="row">
												{n.출원인명}
											</TableCell>

											<TableCell className="truncate" component="th" scope="row">
												{/* {n.categories.join(", ")} */}
												{n.특허고객대표번호}
											</TableCell>

											<TableCell component="th" scope="row" align="right">
												{/* <span>$</span>
                                                {n.priceTaxIncl} */}
												{n.출원인대표명}
											</TableCell>

											<TableCell component="th" scope="row" align="right">
												{/* {n.quantity} */}
												{n.출원인영문대표명}
												<i
													className={clsx(
														'inline-block w-8 h-8 rounded ml-8',
														n.quantity <= 5 && 'bg-red',
														n.quantity > 5 && n.quantity <= 25 && 'bg-orange',
														n.quantity > 25 && 'bg-green'
													)}
												/>
											</TableCell>

											{/* <TableCell
                                                component="th"
                                                scope="row"
                                                align="right"
                                            >
                                                {n.active ? (
                                                    <Icon className="text-green text-20">
                                                        check_circle
                                                    </Icon>
                                                ) : (
                                                    <Icon className="text-red text-20">
                                                        remove_circle
                                                    </Icon>
                                                )}
                                            </TableCell> */}
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
				</FuseScrollbars>

				<TablePagination
					component="div"
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					backIconButtonProps={{
						'aria-label': 'Previous Page'
					}}
					nextIconButtonProps={{
						'aria-label': 'Next Page'
					}}
					onChangePage={handleChangePage}
					onChangeRowsPerPage={handleChangeRowsPerPage}
				/>
			</div>
		</Paper>
	);
}

export default withRouter(ApplicantTable);
