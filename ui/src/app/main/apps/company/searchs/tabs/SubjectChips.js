import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chip, Typography, Icon, Popover } from '@material-ui/core';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import * as Actions from '../../store/actions';

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
	}
}));

function SubjectChips(props) {
	const { searchText, topic } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);

	function handleClick(value) {
		// prepare api parameters
		const { terms: _, ...paramsCopy } = searchParams;
		paramsCopy.keyword = searchText;
		paramsCopy.inventor = searchParams.inventor.join(' and ');
		paramsCopy.assignee = searchParams.assignee.join(' and ');
		paramsCopy.keywordvec = value; // updateSubjectRelation 에서만 이 line 추가

		dispatch(resetSubjectRelationVec(topic));
		dispatch(updateSubjectRelation(paramsCopy));
	}

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return topic ? (
		<div className="flex flex-col">
			<div className="p-12 flex items-center">
				<Typography variant="h6">핵심주제어</Typography>
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
						검색결과에서 의미 있는 핵심 주제어를 추출하고, 핵심키워드와 비교하여 유사 관계를 표시합니다.
					</Typography>
				</Popover>
			</div>

			<FuseScrollbars className="flex flex-no-overflow items-center overflow-x-auto">
				<div className={clsx(topic && topic.length > 0 ? '' : 'hidden', classes.root)}>
					{topic.map((value, index) => (
						<Chip label={value} key={value} size="small" onClick={() => handleClick(value)} />
					))}
				</div>
			</FuseScrollbars>
		</div>
	) : (
		<div />
	);
}

export default SubjectChips;
