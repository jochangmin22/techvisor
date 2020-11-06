import React from 'react';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	title: {
		color: theme.palette.primary.dark,
		marginBottom: 4,
		paddingTop: theme.spacing(2)
	},
	subTitle: {
		color: theme.palette.text.primary,
		marginTop: 4,
		marginBottom: 4,
		paddingTop: theme.spacing(0.5),
		paddingBottom: theme.spacing(0.5)
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function PopoverContent(props) {
	const { content, title, variant } = props;
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div className="flex flex-shrink-0 items-center">
			<Typography variant={variant || 'h6'}>{title}</Typography>
			<Icon
				className="ml-8"
				color="action"
				aria-owns={open ? 'mouse-over-popover' : undefined}
				aria-haspopup="true"
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
			>
				help_outline
			</Icon>
			<Popover
				id="mouse-over-popover"
				className={classes.popover}
				classes={{
					paper: classes.paper
				}}
				open={open}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				onClose={handlePopoverClose}
				disableRestoreFocus
			>
				<div className="h-auto w-sm p-8">{content}</div>
			</Popover>
		</div>
	);
}

export default PopoverContent;
