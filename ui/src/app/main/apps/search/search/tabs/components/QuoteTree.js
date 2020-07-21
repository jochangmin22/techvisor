import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

const useTreeItemStyles = makeStyles(theme => ({
	root: {
		color: theme.palette.text.secondary,
		'&:hover > $content': {
			backgroundColor: theme.palette.action.hover
		},
		'&:focus > $content, &$selected > $content': {
			backgroundColor: 'var(--tree-view-bg-color)',
			color: 'var(--tree-view-color)'
		},
		'&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
			backgroundColor: 'transparent'
		}
	},
	content: {
		color: theme.palette.text.secondary,
		borderTopRightRadius: theme.spacing(2),
		borderBottomRightRadius: theme.spacing(2),
		paddingRight: theme.spacing(1),
		fontWeight: theme.typography.fontWeightMedium,
		'$expanded > &': {
			fontWeight: theme.typography.fontWeightRegular
		}
	},
	group: {
		marginLeft: 0,
		'& $content': {
			paddingLeft: theme.spacing(2)
		}
	},
	expanded: {},
	selected: {},
	label: {
		fontWeight: 'inherit',
		color: 'inherit'
	},
	labelRoot: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0.5, 0)
	},
	labelIcon: {
		marginRight: theme.spacing(1)
	},
	labelText: {
		fontWeight: 'inherit',
		flexGrow: 1
	}
}));

function StyledTreeItem(props) {
	const classes = useTreeItemStyles();
	// const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;
	const { labelText, labelInfo, color, bgColor, ...other } = props;

	return (
		<TreeItem
			label={
				<div className={classes.labelRoot}>
					{/* <LabelIcon color="inherit" className={classes.labelIcon} /> */}
					<Typography variant="body2" className={classes.labelText}>
						{labelText}
					</Typography>
					<Typography variant="caption" color="inherit">
						{labelInfo}
					</Typography>
				</div>
			}
			style={{
				'--tree-view-color': color,
				'--tree-view-bg-color': bgColor
			}}
			classes={{
				root: classes.root,
				content: classes.content,
				expanded: classes.expanded,
				selected: classes.selected,
				group: classes.group,
				label: classes.label
			}}
			{...other}
		/>
	);
}

StyledTreeItem.propTypes = {
	bgColor: PropTypes.string,
	color: PropTypes.string,
	// labelIcon: PropTypes.elementType.isRequired,
	labelInfo: PropTypes.number,
	labelText: PropTypes.string.isRequired
};

const useStyles = makeStyles({
	root: {
		// height: 264,
		flexGrow: 1,
		maxWidth: 400
	}
});

function QuoteTree(props) {
	const classes = useStyles();
	const data = props.data;

	const Btotal = data.filter(x => {
		return x.식별코드 === 'B1';
	}).length;
	const Ftotal = data.length - Btotal;

	const BKRtotal = data.filter(x => {
		return x.식별코드 === 'B1' && x.국가 === 'KR';
	}).length;
	const FKRtotal = data.filter(x => {
		return x.식별코드 === 'F1' && x.국가 === 'KR';
	}).length;

	return (
		<TreeView
			className={classes.root}
			defaultExpanded={['1']}
			defaultCollapseIcon={<ArrowDropDownIcon />}
			defaultExpandIcon={<ArrowRightIcon />}
			defaultEndIcon={<div style={{ width: 24 }} />}
		>
			<StyledTreeItem nodeId="1" labelText="인용 소계" labelInfo={Btotal}>
				<StyledTreeItem
					nodeId="2"
					labelText="논문·외국특허"
					// labelIcon={AddIcon}
					labelInfo={Btotal - BKRtotal}
					color="#1a73e8"
					bgColor="#e8f0fe"
				/>
				<StyledTreeItem
					nodeId="3"
					labelText="국내특허"
					// labelIcon={InfoIcon}
					labelInfo={BKRtotal}
					color="#e3742f"
					bgColor="#fcefe3"
				/>
			</StyledTreeItem>
			<StyledTreeItem nodeId="4" labelText="피인용 소계" labelInfo={Ftotal}>
				<StyledTreeItem
					nodeId="5"
					labelText="논문·외국특허"
					// labelIcon={ForumIcon}
					labelInfo={Ftotal - FKRtotal}
					color="#a250f5"
					bgColor="#f3e8fd"
				/>
				<StyledTreeItem
					nodeId="6"
					labelText="국내특허"
					// labelIcon={LocalOfferIcon}
					labelInfo={FKRtotal}
					color="#3c8039"
					bgColor="#e6f4ea"
				/>
			</StyledTreeItem>
		</TreeView>
	);
}

export default QuoteTree;
