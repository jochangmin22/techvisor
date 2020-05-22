/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import SubjectContext from '../SubjectContext';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		height: '68px',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	},
	positiveBackground: { backgroundColor: theme.palette.primary.dark },
	negativeBackground: { backgroundColor: theme.palette.primary.light }
}));

function NewsAnalysis(props) {
	const classes = useStyles();
	const news = useSelector(({ searchApp }) => searchApp.searchs.news);
	const { searchText } = props;

	const { setShowLoading } = useContext(SubjectContext);

	const [ratioValue, setRatioValue] = useState(40);

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div className="flex flex-col">
			<div className="p-12 flex items-center">
				<Typography variant="h6">뉴스분석</Typography>
				<Icon
					className="ml-8"
					color="action"
					aria-owns={open ? 'mouse-over-popover' : undefined}
					aria-haspopup="true"
					onMouseEnter={handlePopoverOpen}
					onMouseLeave={handlePopoverClose}
				>
					error_outline
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
						horizontal: 'left'
					}}
					onClose={handlePopoverClose}
					disableRestoreFocus
				>
					<Typography variant="body2">
						검색어와 관련하여 머신러닝 기술을 기반으로 최근 50건의 뉴스의 긍정부정을 판단합니다.
					</Typography>
				</Popover>
			</div>

			<div className="flex flex-col items-center justify-center w-full h-18 px-8">
				<div className="flex flex-row w-full h-full rounded-4 shadow">
					<div
						className={clsx(
							classes.positiveBackground,
							'h-full items-center justify-center text-center text-11 p-4 text-white'
						)}
						style={{
							width: `${ratioValue}%`,
							transition: 'all .2s ease-out'
						}}
					>
						긍정 {ratioValue}%
					</div>
					<div
						className={clsx(
							classes.negativeBackground,
							'h-full items-center justify-center text-center text-11 p-4 text-white'
						)}
						style={{
							width: `${100 - ratioValue}%`,
							transition: 'all .2s ease-out'
						}}
					>
						부정 {100 - ratioValue}%
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewsAnalysis;
