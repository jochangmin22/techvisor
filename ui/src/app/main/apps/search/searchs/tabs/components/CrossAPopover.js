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
		color: theme.palette.primary.main,
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

function CrossAPopover() {
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
					<Typography className={classes.title}>피인용도지수(Cites Per Patent, CPP)</Typography>
					<Typography variant="caption">
						피인용이 높을 수록 영향력이 크며, 특허수 대비 인용수를 기준으로 계산됩니다.
					</Typography>
					<Typography className={classes.title}>영향력지수(Patent Impact Index, PII)</Typography>
					<Typography variant="caption">
						PII가 높을 수록 소유한 기술의 질적 수준이 높으며, CPP를 전체 등록특허의 피인용도로 나눈 값으로
						계산됩니다.
					</Typography>
					<Typography className={classes.title}>기술력지수(Technology Strength, TS)</Typography>
					<Typography variant="caption">
						TS가 높을 수록 기술적 역량이 크며, CPP에 특허건수를 곱한 값으로 계산됩니다.
					</Typography>
					<Typography className={classes.title}>시장확보지수(Patent Family Size, PFS)</Typography>
					<Typography variant="caption">
						패밀리 보유 건이 많은 척도로 많을 수록 시장력이 강합니다. 특허수 대비 패밀리수를 기준으로
						계산됩니다.
					</Typography>
				</div>
			</Popover>
		</div>
	);
}

export default CrossAPopover;
