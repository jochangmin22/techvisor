import React, { useMemo, useState, useEffect } from 'react';
import {
	// TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Icon,
	IconButton,
	Typography,
	Toolbar,
	AppBar,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	OutlinedInput
} from '@material-ui/core';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { DataGrid, GridColumn } from 'rc-easyui';
import * as Actions from './store/actions';
import reducer from './store/reducers';
// import _ from "@lodash";

// import { useForm } from "@fuse/hooks";
// import MailAttachment from "./MailAttachment";
// TODO SearchText는 분류사전 다수일때 같이 구현
function ClassifyDictionary() {
	const dispatch = useDispatch();
	const dictionaries = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.dictionaries);
	const categories = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.categories);
	const [filteredData, setFilteredData] = useState(null);
	// const [searchText, setSearchText] = useState("");
	const [openDialog, setOpenDialog] = useState(false);
	// const { form, handleChange } = useForm({
	//     from: "johndoe@creapond.com",
	//     to: "",
	//     cc: "",
	//     bcc: "",
	//     subject: "",
	//     message: ""
	// });

	const [selectedCategory, setSelectedCategory] = useState('');

	// useEffect(() => {
	//     dispatch(Actions.getCategories());
	// }, [dispatch]);

	useEffect(() => {
		// dispatch(Actions.getCategories());
		if (selectedCategory) {
			dispatch(Actions.getDictionaries(selectedCategory));
		}
	}, [dispatch, selectedCategory]);

	useEffect(() => {
		// function getFilteredArray() {
		//     if (
		//         searchText.length === 0 &&
		//         selectedCategory === "산업특허연계표"
		//     ) {
		//         return dictionaries;
		//     }

		//     return _.filter(dictionaries, item => {
		//         if (
		//             selectedCategory !== "all" &&
		//             item.category !== selectedCategory
		//         ) {
		//             return false;
		//         }
		//         return item.title
		//             .toLowerCase()
		//             .includes(searchText.toLowerCase());
		//     });
		// }

		if (dictionaries) {
			// setFilteredData(getFilteredArray());
			setFilteredData(dictionaries);
		}
		// }, [dictionaries, searchText, selectedCategory]);
	}, [dictionaries, selectedCategory]);

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
		dispatch(Actions.setSelectedDictionary(event.target.value));
	}

	// function handleSearchText(event) {
	//     setSearchText(event.target.value);
	// }

	function handleOpenDialog() {
		setOpenDialog(true);
	}

	function handleCloseDialog() {
		setOpenDialog(false);
	}

	function handleDelete() {
		setOpenDialog(false);
	}

	// function handleSubmit(ev) {
	//     ev.preventDefault();
	//     setOpenDialog(false);
	// }

	return (
		<div className="p-24">
			<Button variant="contained" color="primary" className="w-full" onClick={handleOpenDialog}>
				분류사전 선택
			</Button>

			<Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
				<AppBar position="static">
					<div className="flex flex-col flex-shrink-0 sm:flex-row items-center justify-between py-24">
						<Toolbar className="flex w-full">
							<Typography variant="subtitle1" color="inherit">
								분류사전 선택
							</Typography>
						</Toolbar>
						{/* <TextField
                            label="분류사전 검색"
                            placeholder="검색어를 입력하세요..."
                            className="flex w-full sm:w-lg mb-16 sm:mb-0 mx-16"
                            value={searchText}
                            inputProps={{
                                "aria-label": "Search"
                            }}
                            onChange={handleSearchText}
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true
                            }}
                        /> */}
						<FormControl className="flex w-full sm:w-md mx-16" variant="outlined">
							<InputLabel htmlFor="category-label-placeholder">분류사전</InputLabel>
							<Select
								value={selectedCategory}
								onChange={handleSelectedCategory}
								input={
									<OutlinedInput
										labelWidth={'category'.length * 9}
										name="category"
										id="category-label-placeholder"
									/>
								}
							>
								{categories.map(category => (
									<MenuItem value={category.value} key={category.id}>
										{category.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
				</AppBar>
				{useMemo(
					() =>
						filteredData &&
						(filteredData.length > 0 ? (
							<FuseAnimateGroup
								enter={{
									animation: 'transition.slideUpBigIn'
								}}
								className="flex flex-wrap"
							>
								<DialogContent
									classes={{
										root: 'p-16'
									}}
								>
									<DataGrid data={filteredData} columnResizing style={{ width: 800, height: 250 }}>
										<GridColumn field="산업명" title="산업명" width="20%" />
										<GridColumn
											field="산업분류(KSIC)"
											title="산업분류(KSIC)"
											align="right"
											width="20%"
										/>
										<GridColumn field="특허분류(IPC)" title="특허분류(IPC)" width="60%" />
									</DataGrid>
								</DialogContent>
							</FuseAnimateGroup>
						) : (
							<DialogContent
								classes={{
									root: 'p-16 pb-0 sm:p-24 sm:pb-0'
								}}
							>
								<Typography color="textSecondary" className="text-18 my-24">
									선택된 분류사전이 없습니다.
								</Typography>
							</DialogContent>
						)),
					[filteredData]
				)}

				<DialogActions className="justify-between pl-8 sm:pl-16">
					{/* <div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                // dispatch(Actions.updateTodo(form));
                                setOpenDialog(false);
                            }}
                        >
                            적용
                        </Button>
                        <IconButton>
                                <Icon>attach_file</Icon>
                            </IconButton>
                    </div> */}
					<IconButton onClick={handleDelete}>
						<Icon>delete</Icon>
					</IconButton>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default withReducer('classifyApp', reducer)(ClassifyDictionary);
