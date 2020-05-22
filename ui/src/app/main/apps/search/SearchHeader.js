import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import reducer from './store/reducers';
import parseSearchText from './inc/parseSearchText';
import * as Actions from './store/actions';
// import { showMessage } from 'app/store/actions/fuse';

function SearchHeader(props) {
	const dispatch = useDispatch();
	const mainTheme = useSelector(({ fuse }) => fuse.settings.mainTheme);
	const searchLoading = useSelector(({ searchApp }) => searchApp.searchs.searchLoading);
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

	// useEffect(() => {
	// 	setInputSearchText(searchNum);
	// }, [searchNum]);

	const handleChange = useCallback(event => setInputSearchText(event.target.value), []);
	// function onInputChange(ev) {
	// 	setInputSearchText(ev.target.value);
	// }

	function onSearchSubmit(ev) {
		ev.preventDefault();
		if (inputSearchText === '') {
			return;
		}

		const numberRegexp = /^[0-9.-]*$/;
		const match = inputSearchText.match(numberRegexp);
		if (match) {
			// number search ?
			dispatch(Actions.setSearchNum(inputSearchText));
			dispatch(Actions.setSearchSubmit(true));
			// dispatch(Actions.setSearchLoading(true));
			// dispatch(Actions.clearSearchs());
			// dispatch(Actions.clearWidgetsData());
			// dispatch(Actions.getSearchsNum({ searchNum: inputSearchText })).then(() => {
			// 	dispatch(Actions.getWordCloud({ searchNum: inputSearchText }));
			// 	dispatch(Actions.getSubjectRelation({ searchNum: inputSearchText }));
			// 	dispatch(Actions.setSearchLoading(false));
			// });
		} else {
			const [newParams] = parseSearchText(null, inputSearchText); // not use first args searchParams (null)
			newParams['searchNum'] = ''; // prevent uncontrolled error
			dispatch(Actions.setSearchParams(newParams));
			dispatch(Actions.setSearchSubmit(true));
			// console.log('onSearchSubmit -> newParams', newParams);
			// dispatch(Actions.setSearchLoading(true));
			// dispatch(Actions.clearSearchs());
			// dispatch(Actions.clearWidgetsData());
			// dispatch(Actions.getSearchs(newApiParams)).then(() => {
			// 	dispatch(Actions.getWordCloud(newApiParams));
			// 	dispatch(Actions.getSubjectRelation(newApiParams));
			// 	dispatch(Actions.setSearchLoading(false));
			// });
		}
	}

	return (
		<ThemeProvider theme={mainTheme}>
			<Paper className="flex items-center w-full h-48 sm:h-56 p-16 pl-4 md:pl-16 rounded-8 " elevation={1}>
				<Hidden lgUp>
					<IconButton
						onClick={ev => props.pageLayout.current.toggleLeftSidebar()}
						aria-label="open left sidebar"
					>
						<Icon>menu</Icon>
					</IconButton>
				</Hidden>

				{searchLoading ? <CircularProgress size={24} /> : <Icon color="action">search</Icon>}
				<form className="flex items-center w-full h-full" onSubmit={onSearchSubmit}>
					<Input
						name="searchText"
						placeholder="Search"
						className="pl-16"
						disableUnderline
						autoComplete="off"
						fullWidth
						value={inputSearchText}
						// onChange={onInputChange}
						onChange={handleChange}
						inputProps={{
							'aria-label': 'Search'
						}}
					/>
					<IconButton onClick={() => dispatch(Actions.clearSearchText())} className="mx-8">
						<Icon>close</Icon>
					</IconButton>
				</form>
			</Paper>
		</ThemeProvider>
	);
}
export default withReducer('searchApp', reducer)(SearchHeader);
