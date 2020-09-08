import _ from '@lodash';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import React, { useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';

function DownloadFilterMenu(props) {
	const { cols, colsList } = props;

	const [anchorEl, setAnchorEl] = useState(null);

	function handleMenuClick(event) {
		setAnchorEl(event.currentTarget);
	}

	function handleMenuClose() {
		setAnchorEl(null);
	}

	function handleToggleItem(id) {
		props.onChange(_.xor(props.cols, [id]));
	}

	return (
		<Tooltip title="다운로드 항목설정" placement="bottom">
			<div>
				<IconButton className="w-32 h-32 m-4 p-4" onClick={handleMenuClick}>
					<Icon>settings</Icon>
				</IconButton>
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
							{Object.entries(colsList).map(([key, item]) => (
								<ListItem key={item.id} button dense onClick={() => handleToggleItem(item.id)}>
									<Icon className="list-item-icon text-16" color="action">
										{cols.includes(item.id) ? 'check_box' : 'check_box_outline_blank'}
									</Icon>
									<ListItemText className="truncate px-8" primary={item.name} disableTypography />
								</ListItem>
							))}
						</List>
					</ClickAwayListener>
				</Popover>
			</div>
		</Tooltip>
	);
}

export default DownloadFilterMenu;
