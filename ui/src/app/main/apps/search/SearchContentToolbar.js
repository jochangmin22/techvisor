import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import { parseInputSearchText } from 'app/main/apps/lib/parseSearchText';
import { clearSearchText, setSearchParams, setSearchNum, setSearchSubmit } from './store/searchsSlice';

const useStyles = makeStyles(theme => ({
	root: {},
	input: {
		transition: theme.transitions.create(['background-color'], {
			easing: theme.transitions.easing.easeInOut,
			duration: theme.transitions.duration.short
		}),
		'&:focus': {
			backgroundColor: theme.palette.background.paper
		}
	}
}));

function SearchContentToolbar(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchNum = useSelector(({ searchApp }) => searchApp.searchs.searchParams.searchNum);
	const searchText = useSelector(({ searchApp }) => searchApp.searchs.searchParams.searchText);

	const [inputSearchText, setInputSearchText] = useState(
		searchNum && searchNum.match(/^[0-9.-]*$/) ? searchNum || '' : searchText || ''
	);

	useEffect(() => {
		let value;
		if (searchText !== '') {
			value = searchText;
		}
		if (searchNum !== '') {
			value = searchNum;
		}
		// clear
		if (searchNum === '' && searchText === '') {
			value = '';
		}
		setInputSearchText(value || '');
	}, [searchText, searchNum]);

	const handleChange = useCallback(event => setInputSearchText(event.target.value), []);

	function onSearchSubmit(ev) {
		ev.preventDefault();
		if (inputSearchText === '') {
			return;
		}

		const numberRegexp = /^[0-9.-]*$/;
		const match = inputSearchText.match(numberRegexp);
		if (match) {
			// number search ?
			dispatch(clearSearchText());
			dispatch(setSearchNum(inputSearchText));
			dispatch(setSearchSubmit(true));
		} else {
			const [_params] = parseInputSearchText(inputSearchText);
			_params['searchNum'] = ''; // prevent uncontrolled error
			dispatch(setSearchParams(_params));
			dispatch(setSearchSubmit(true));
		}
	}

	return (
		<div className="flex items-center w-full h-48 sm:h-56">
			<Hidden lgUp>
				<IconButton onClick={ev => props.pageLayout.current.toggleLeftSidebar()} aria-label="open left sidebar">
					<Icon>menu</Icon>
				</IconButton>
			</Hidden>

			<form className="flex items-center w-full h-full" onSubmit={onSearchSubmit}>
				<TextField
					name="searchText"
					placeholder="Search"
					autoComplete="off"
					fullWidth
					value={inputSearchText}
					onChange={handleChange}
					InputProps={{
						// disableUnderline: true,
						startAdornment: (
							<InputAdornment position="start">
								<Icon color="action">search</Icon>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={() => dispatch(clearSearchText())} className="h-36 w-36">
									<Icon>close</Icon>
								</IconButton>
							</InputAdornment>
						),
						inputRef: node => {
							// ref(node);
							// inputRef(node);
						},
						classes: {
							input: clsx(classes.input, 'py-0 px-16 h-48 ltr:pr-48 rtl:pl-48'),
							notchedOutline: 'rounded-8'
						}
					}}
					variant="outlined"
				/>
			</form>
		</div>
	);
}

export default withReducer('searchApp', reducer)(SearchContentToolbar);
