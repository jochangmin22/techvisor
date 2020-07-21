import React, { useState } from 'react';
import Chip from '@material-ui/core/Chip';
import TableHead from '@material-ui/core/TableHead';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Menu from '@material-ui/core/Menu';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const rows = [
	{
		id: '특허고객번호', // "image",
		align: 'left',
		disablePadding: true,
		label: '특허고객번호', // "",
		sort: false
	},
	{
		id: '출원인명', // "name",
		align: 'left',
		disablePadding: false,
		label: '출원인명', // "Name",
		sort: true
	},
	{
		id: '특허고객대표번호', // "categories",
		align: 'left',
		disablePadding: false,
		label: '특허고객대표번호', // "Category",
		sort: true
	},
	{
		id: '출원인대표명', // "priceTaxIncl",
		align: 'right',
		disablePadding: false,
		label: '출원인대표명', // "Price",
		sort: true
	},
	{
		id: '출원인영문대표명', // "quantity",
		align: 'right',
		disablePadding: false,
		label: '출원인영문대표명', // "Quantity",
		sort: true
	},
	{
		id: '', // "active",
		align: 'right',
		disablePadding: false,
		label: 'Active',
		sort: '' // true
	}
];

const useStyles = makeStyles(theme => ({
	actionsButtonWrapper: {
		background: theme.palette.background.paper
	}
}));

function ApplicantTableHead(props) {
	const classes = useStyles(props);
	const [selectedProductsMenu, setSelectedProductsMenu] = useState(null);

	const createSortHandler = property => event => {
		props.onRequestSort(event, property);
	};

	function openSelectedProductsMenu(event) {
		setSelectedProductsMenu(event.currentTarget);
	}

	function closeSelectedProductsMenu() {
		setSelectedProductsMenu(null);
	}

	return (
		<TableHead>
			{/* <TableRow className="h-64"> */}
			<TableRow>
				<TableCell padding="checkbox" className="relative pl-4 sm:pl-12">
					<Checkbox
						indeterminate={props.numSelected > 0 && props.numSelected < props.rowCount}
						checked={props.numSelected === props.rowCount}
						onChange={props.onSelectAllClick}
					/>
					{props.numSelected > 0 && (
						<div
							className={clsx(
								'flex items-center justify-center absolute w-64 top-0 left-0 ml-48 h-64 z-10',
								classes.actionsButtonWrapper
							)}
						>
							<IconButton
								aria-owns={selectedProductsMenu ? 'selectedProductsMenu' : null}
								aria-haspopup="true"
								onClick={openSelectedProductsMenu}
							>
								<Icon>more_horiz</Icon>
							</IconButton>
							<Menu
								id="selectedProductsMenu"
								anchorEl={selectedProductsMenu}
								open={Boolean(selectedProductsMenu)}
								onClose={closeSelectedProductsMenu}
							>
								<MenuList>
									<MenuItem
										onClick={() => {
											// dispatch(saveList(selectedContactIds));
											closeSelectedProductsMenu();
										}}
									>
										<ListItemIcon className="min-w-40">
											<Icon>star</Icon>
										</ListItemIcon>
										<ListItemText primary="관심기술 저장" />
									</MenuItem>
									<MenuItem
										onClick={() => {
											// dispatch(downloadList(selectedContactIds));
											closeSelectedProductsMenu();
										}}
									>
										<ListItemIcon className="min-w-40">
											<Icon>delete</Icon>
										</ListItemIcon>
										<ListItemText primary="선택삭제" />
									</MenuItem>
									<MenuItem
										onClick={() => {
											// dispatch(downloadList(selectedContactIds));
											closeSelectedProductsMenu();
										}}
									>
										<ListItemIcon className="min-w-40">
											<Icon>star_border</Icon>
										</ListItemIcon>
										<ListItemText primary="다운로드" />
									</MenuItem>
								</MenuList>
							</Menu>
						</div>
					)}
				</TableCell>
				{rows.map(row => {
					return (
						<TableCell
							key={row.id}
							align={row.align}
							padding={row.disablePadding ? 'none' : 'default'}
							sortDirection={props.order.id === row.id ? props.order.direction : false}
						>
							{row.sort && (
								<Tooltip
									title="Sort"
									placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
									enterDelay={300}
								>
									<TableSortLabel
										active={props.order.id === row.id}
										direction={props.order.direction}
										onClick={createSortHandler(row.id)}
									>
										{row.label}
									</TableSortLabel>
								</Tooltip>
							)}
						</TableCell>
					);
				}, this)}
			</TableRow>
		</TableHead>
	);
}

export default ApplicantTableHead;
