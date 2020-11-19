import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import { clearSearchText, getSearchs } from 'app/main/apps/company/store/searchsSlice';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => ({
	default: {
		backgroundColor: theme.palette.background.default,
		color: theme.palette.getContrastText(theme.palette.background.default)
	},
	paper: { backgroundColor: theme.palette.background.paper },
	root: {
		width: '100%',
		padding: theme.spacing(1),
		'& > * + *': {
			margin: theme.spacing(2)
		}
	}
}));

function CompanyContentTitle(props) {
	const dispatch = useDispatch();
	const { corpName, stockCode } = props.selectedCorp;
	const classes = useStyles();
	const selectOne = !Object.values(props.selectedCorp).every(x => x === null || x === '');
	const [open, setOpen] = React.useState(selectOne);

	const handleClick = () => {
		setOpen(false);
		dispatch(clearSearchText());
		const params = {
			params: { searchText: 'all' },
			subParams: {}
		};
		dispatch(getSearchs(params));
	};

	return (
		<div className={classes.root}>
			<Collapse in={open}>
				<div
					className={clsx(
						classes.paper,
						'flex flex-row justify-start items-center w-full h-auto p-8 rounded-8 shadow'
					)}
				>
					<IconButton
						aria-label="close"
						color="inherit"
						size="small"
						onClick={() => {
							handleClick();
						}}
					>
						<CloseIcon fontSize="inherit" />
					</IconButton>
					<Typography className={clsx(classes.default, 'text-13 font-400 rounded-4 px-8 py-4 mx-8 my-4')}>
						종목코드 {stockCode} <span className="font-extrabold text-14 ml-8">{corpName}</span>
					</Typography>
				</div>
			</Collapse>
		</div>
	);
}

export default CompanyContentTitle;
