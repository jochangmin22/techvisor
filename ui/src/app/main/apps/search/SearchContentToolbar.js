import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import { parseInputSearchText } from 'app/main/apps/lib/parseSearchText';
import {
	clearSearchText,
	setSearchParams,
	setSearchNum,
	setSearchSubmit
} from 'app/main/apps/search/store/searchsSlice';

function SearchContentToolbar(props) {
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
		<Paper
			className="flex items-center w-full h-48 sm:h-56 p-16 ltr:pl-4 lg:ltr:pl-16 rtl:pr-4 lg:rtl:pr-16 rounded-8"
			elevation={1}
		>
			<Hidden lgUp>
				<IconButton onClick={ev => props.pageLayout.current.toggleLeftSidebar()} aria-label="open left sidebar">
					<Icon>menu</Icon>
				</IconButton>
			</Hidden>
			<Icon color="action">search</Icon>
			<form className="flex items-center w-full h-full" onSubmit={onSearchSubmit}>
				<TextField
					name="searchText"
					placeholder="Search"
					autoComplete="off"
					fullWidth
					value={inputSearchText}
					onChange={handleChange}
					InputProps={{
						disableUnderline: true,
						inputRef: node => {},
						classes: {
							input: 'py-0 px-16 h-48 ltr:pr-48 rtl:pl-48'
						}
					}}
					className="border-none"
				/>
			</form>
			<IconButton onClick={() => dispatch(clearSearchText())} className="h-36 w-36">
				<Icon>close</Icon>
			</IconButton>
		</Paper>
	);
}

export default withReducer('searchApp', reducer)(SearchContentToolbar);