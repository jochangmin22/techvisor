import React from 'react';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	title: {
		color: theme.palette.primary.dark,
		marginBottom: 4
	},
	subTitle: { color: theme.palette.primary.main, marginTop: 4, marginBottom: 4 },
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function IpcPiePopover() {
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
				<div className="h-auto w-sm p-8">
					<Typography className={classes.title}>IPC (International Patent Classification)란?</Typography>
					<Typography variant="caption">
						특허분류체계를 국제적으로 통일시킬 목적으로 체결된 국제특허분류에 관한 Strasbourg협정에 따라
						세계지식재산권기구(WIPO)가 1975년 10월에 제정한 국제적으로 통요되는 기술분야별 분류기호입니다.
					</Typography>
					<div className="flex w-1/2">
						<div className="w-full">
							<Typography variant="body1" className={classes.subTitle}>
								A. 생활필수품
							</Typography>
							<Typography variant="body1" className={classes.subTitle}>
								B. 처리조작
							</Typography>

							<Typography variant="body1" className={classes.subTitle}>
								C. 화학, 야금
							</Typography>
							<Typography variant="body1" className={classes.subTitle}>
								D. 섬유, 지류
							</Typography>
						</div>
						<div className="w-full">
							<Typography variant="body1" className={classes.subTitle}>
								E. 고정구조물
							</Typography>
							<Typography variant="body1" className={classes.subTitle}>
								F. 기계공학 등
							</Typography>
							<Typography variant="body1" className={classes.subTitle}>
								G. 물리학
							</Typography>
							<Typography variant="body1" className={classes.subTitle}>
								H. 전기
							</Typography>
						</div>
					</div>
				</div>
			</Popover>
		</div>
	);
}

export default IpcPiePopover;
