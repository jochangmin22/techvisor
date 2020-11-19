import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import React, { useState } from 'react';
import RefreshIcon from '@material-ui/icons/Refresh';
import Tooltip from '@material-ui/core/Tooltip';
import { useDispatch } from 'react-redux';
import { resetCols } from 'app/main/apps/search/store/searchsSlice';

function ColumnMenu(props) {
	const { cols } = props;
	const dispatch = useDispatch();

	const [anchorEl, setAnchorEl] = useState(null);

	function handleMenuClick(event) {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	}

	function handleMenuClose() {
		setAnchorEl(null);
	}

	function handleToggleItem(index, bVal) {
		const newCols = cols.map((obj, idx) => (idx === index ? { ...obj, visible: bVal } : obj));
		props.onChange(newCols);
	}

	function handleReset() {
		dispatch(resetCols());
	}

	return (
		<div>
			<Tooltip title="테이블 컬럼 항목설정" placement="bottom">
				<IconButton className="w-32 h-32 m-4 p-4" onClick={handleMenuClick}>
					<Icon>settings</Icon>
				</IconButton>
			</Tooltip>
			<Popover
				hideBackdrop
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				className="pointer-events-none"
				classes={{
					paper: 'pointer-events-auto py-8 prevent-add-close'
				}}
			>
				<ClickAwayListener onClickAway={handleMenuClose}>
					<List className="p-0">
						<div className="p-24">
							<Button
								variant="outlined"
								color="primary"
								className="w-full"
								size="small"
								startIcon={<RefreshIcon />}
								onClick={() => handleReset()}
							>
								초기화
							</Button>
						</div>
						{Object.entries(cols).map(([n, it], index) => (
							<ListItem
								key={n}
								button
								className="py-0"
								onClick={() => handleToggleItem(index, !cols[n]['visible'])}
							>
								<Icon className="list-item-icon text-16" color="action">
									{cols[n]['visible'] ? 'check_box' : 'check_box_outline_blank'}
								</Icon>
								<ListItemText className="truncate px-8" primary={it.header} disableTypography />
							</ListItem>
						))}
					</List>
				</ClickAwayListener>
			</Popover>
		</div>
	);
}

export default ColumnMenu;
