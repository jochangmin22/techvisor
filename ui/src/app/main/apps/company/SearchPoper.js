/* eslint-disable no-use-before-define */
import React, { useState } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { parseInputSearchText } from 'app/main/apps/lib/parseParamsCompany';
import { setSearchParams, setSearchSubmit, setSelectedCorp } from 'app/main/apps/company/store/searchsSlice';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
		width: 221,
		fontSize: 13
	},
	button: {
		fontSize: 13,
		width: '100%',
		textAlign: 'left',
		paddingBottom: 8,
		color: '#586069',
		fontWeight: 600,
		'&:hover,&:focus': {
			color: '#0366d6'
		},
		'& span': {
			width: '100%'
		},
		'& svg': {
			width: 16,
			height: 16
		}
	},
	tag: {
		marginTop: 3,
		height: 20,
		padding: '.15em 4px',
		fontWeight: 600,
		lineHeight: '15px',
		borderRadius: 2
	},
	popper: {
		border: '1px solid rgba(27,31,35,.15)',
		boxShadow: '0 3px 12px rgba(27,31,35,.15)',
		borderRadius: 3,
		marginTop: '0.5rem',
		width: 900,
		zIndex: 1,
		fontSize: 13,
		color: '#586069',
		backgroundColor: '#f6f8fa'
	},
	header: {
		borderBottom: '1px solid #e1e4e8',
		padding: '8px 10px',
		fontWeight: 600
	},
	inputBase: {
		padding: 10,
		width: '100%',
		borderBottom: '1px solid #dfe2e5',
		'& input': {
			borderRadius: 4,
			backgroundColor: theme.palette.common.white,
			padding: 8,
			transition: theme.transitions.create(['border-color', 'box-shadow']),
			border: '1px solid #ced4da',
			fontSize: 14,
			'&:focus': {
				boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
				borderColor: theme.palette.primary.main
			}
		}
	},
	paper: {
		boxShadow: 'none',
		margin: 0,
		color: '#586069',
		fontSize: 13
	},
	popperDisablePortal: {
		position: 'relative'
	},
	iconSelected: {
		width: 17,
		height: 17,
		marginRight: 5,
		marginLeft: -2
	},
	color: {
		width: 14,
		height: 14,
		flexShrink: 0,
		borderRadius: 3,
		marginRight: 8,
		marginTop: 2
	},
	text: {
		flexGrow: 1
	},
	close: {
		opacity: 0.6,
		width: 18,
		height: 18
	}
}));

const columns = ['기업명', '종목코드', '업종', '주요제품', '지역'];

const SearchPoper = React.forwardRef(function (props, ref) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [anchorEl, setAnchorEl] = useState(props.anchorEl || null);
	// const [pendingValue, setPendingValue] = useState(props.value || []);

	// useEffect(() => {
	// 	setAnchorEl(props.open);
	// }, [props.open]);

	const handleClick = (name, stockCode, corpNo) => {
		// const inputSearchText = '(' + name + ').CN';
		// const [_params] = parseInputSearchText(inputSearchText);
		// _params['companyName'] = [name];
		// _params['searchNum'] = ''; // prevent uncontrolled error
		dispatch(setSelectedCorp({ stockCode: stockCode, corpNo: corpNo }));
		// dispatch(setSearchParams(_params));
		dispatch(setSearchSubmit(true));

		if (anchorEl) {
			anchorEl.focus();
		}
		setAnchorEl(null);
	};

	React.useImperativeHandle(ref, () => {
		return {
			handleOpen(anchorEl) {
				setAnchorEl(anchorEl);
			}
		};
	});

	// const handleClose = (event, reason) => {
	// 	if (reason === 'toggleInput') {
	// 		return;
	// 	}
	// 	setValue(pendingValue);
	// 	if (anchorEl) {
	// 		anchorEl.focus();
	// 	}
	// 	setAnchorEl(null);
	// };

	const open = Boolean(anchorEl);
	// const id = open ? 'SearchPoper' : undefined;

	return (
		<React.Fragment>
			<Popper anchorEl={anchorEl} open={open} placement="bottom-start" className={classes.popper}>
				{props.value ? (
					<Table size="small">
						<TableHead>
							<TableRow>
								{columns.map(key => (
									<TableCell key={key} className="text-12 whitespace-no-wrap">
										{key}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{props.value.map((value, index) => (
								<TableRow
									key={index}
									hover
									className="cursor-pointer"
									onClick={event => {
										handleClick(value.업체명, value.주식코드, value.사업자등록번호);
									}}
								>
									<TableCell width="15%">{value.업체명}</TableCell>
									<TableCell width="10%">{value.주식코드}</TableCell>
									<TableCell width="10%">{value.사업자등록번호}</TableCell>
									<TableCell width="25%" className="font-300 text-12" padding="none">
										{value.업종명}
									</TableCell>
									<TableCell width="40%" className="font-300 text-12" padding="none">
										{value.주요제품}
									</TableCell>
									<TableCell width="10%" className="font-300 text-12 text-center" padding="none">
										{value.주소}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div />
				)}
			</Popper>
		</React.Fragment>
	);
});

export default SearchPoper;
