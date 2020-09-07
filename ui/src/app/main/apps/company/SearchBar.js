import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { useTheme, fade, makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

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
		width: 300,
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
	option: {
		minHeight: 'auto',
		alignItems: 'flex-start',
		padding: 8,
		'&[aria-selected="true"]': {
			backgroundColor: 'transparent'
		},
		'&[data-focus="true"]': {
			backgroundColor: theme.palette.action.hover
		}
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

function SearchBar(props) {
	const classes = useStyles();
	const [open, setOpen] = useState(false);
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);

	const [options, setOptions] = useState(entities);

	const [pendingValue, setPendingValue] = useState([]);

	const loading = open && options.length === 0;

	useEffect(() => {
		let active = true;

		if (!loading) {
			return undefined;
		}

		if (active) {
			setOptions(entities);
		}
		return () => {
			active = false;
		};
	}, [loading, entities]);

	useEffect(() => {
		if (!open) {
			setOptions([]);
		}
	}, [open]);

	return (
		<Autocomplete
			id="asynchronous-searchBar"
			freeSolo
			className="w-full border-none"
			open={open}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
			}}
			// value={props.value}
			// onChange={props.onChange}
			// value={pendingValue}
			// onChange={(event, newValue) => {
			// 	setPendingValue(newValue);
			// }}
			getOptionSelected={(option, value) => option.회사명 === value.회사명}
			getOptionLabel={option => {
				typeof option === 'string' ? console.log(option) : console.log(option.회사명);
				return typeof option === 'string' ? option : option.회사명;
			}}
			renderOption={(option, { selected }) => (
				<Table size="small">
					<TableBody>
						<TableRow key={option.종목코드}>
							<TableCell width="15%">{option.회사명}</TableCell>
							<TableCell width="10%">{option.종목코드}</TableCell>
							<TableCell width="25%" className="font-300 text-12" padding="none">
								{option.업종}
							</TableCell>
							<TableCell width="40%" className="font-300 text-12" padding="none">
								{option.주요제품}
							</TableCell>
							<TableCell width="10%" className="font-300 text-12 text-center" padding="none">
								{option.지역}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			)}
			options={options}
			loading={loading}
			renderInput={params => (
				<TextField
					{...params}
					placeholder="기업검색"
					variant="outlined"
					autoComplete="off"
					onKeyDown={e => {
						if (e.keyCode === 13 && e.target.value) {
							setPendingValue(pendingValue.concat(e.target.value));
						}
					}}
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<>
								{loading ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</>
						)
					}}
				/>
			)}
		/>
	);
}

export default SearchBar;
