import React, { useEffect, useState } from 'react';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import withReducer from 'app/store/withReducer';
import reducer from 'app/main/apps/search/store/reducers';
import { useForm, useDebounce } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import _ from '@lodash';
import * as Actions from 'app/main/apps/search/store/actions';
import ApplicantMTable from './ApplicantMTable';
// import ApplicantRTable from "./ApplicantRTable";
// import ApplicantTable from "./ApplicantTable";

// import { makeStyles } from '@material-ui/core/styles';

function ApplicantMenu(props) {
	const dispatch = useDispatch();

	const applicantClickAwayOpen = useSelector(({ searchApp }) => searchApp.applicant.applicantClickAwayOpen);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const searchText = useSelector(({ searchApp }) => searchApp.applicant.searchText);
	const [applicantForm, setApplicantForm] = useState(searchText);
	const { form: newApplicantForm, handleChange, resetForm } = useForm({
		name: ''
	});

	// useEffect(() => {
	//     setApplicantForm(applicant);
	// }, [applicant]);

	const handleOnChange = useDebounce(searchText => {
		dispatch(getApplicantTable(searchText));
	}, 0);

	useEffect(() => {
		return () => {
			setSuccess(true);
			setLoading(false);
		};
	}, [searchText]);

	useEffect(() => {
		// TODO : 검색어가 동일할 때 안내메세지 추가하기
		if (applicantForm && !_.isEqual(applicantForm, searchText)) {
			if (!loading) {
				setSuccess(false);
				setLoading(true);
			}
			handleOnChange(applicantForm);
		}
		// eslint-disable-next-line
	}, [handleOnChange, searchText, applicantForm]);

	function isFormInValid() {
		return newApplicantForm.name === '';
		// return searchText.name === "";
		// return (searchText.name ? searchText.name : "") === "";
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		if (isFormInValid()) {
			return;
		}
		setApplicantForm(newApplicantForm.name);
		// dispatch(getApplicantTable(newApplicantForm.name));
		// dispatch(getApplicantTable(searchText));

		// const newApplicant = new ApplicantModel(newApplicantForm);
		// setApplicantForm(_.setIn(applicantForm, newApplicant.id, newApplicant));
		resetForm();
	}

	const [formOpen, setFormOpen] = useState(false);

	// function handleFormOpen() {
	// 	setFormOpen(true);
	// 	document.addEventListener('keydown', escFunction, false);
	// }

	function handleFormClose() {
		if (!formOpen) {
			return;
		}
		setFormOpen(false);
		document.removeEventListener('keydown', escFunction, false);
	}

	function escFunction(event) {
		if (event.keyCode === 27) {
			handleFormClose();
		}
	}

	function handleClickAway(ev) {
		const preventCloseElements = document.querySelector('.prevent-add-close');
		const preventClose = preventCloseElements ? preventCloseElements.contains(ev.target) : false;
		if (preventClose) {
			return;
		}
		handleFormClose();
	}

	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<Paper
				className={clsx(
					applicantClickAwayOpen ? '' : 'hidden'
					// "flex flex-col items-center w-full p-6 m-6 min-h-48"
					// "w-full max-w-640 p-12 m-14 rounded-8"
					// "flex items-center w-full max-w-512 mt-8 mb-16 min-h-48"
				)}
				elevation={1}
			>
				<form onSubmit={handleSubmit}>
					<div className="mb-16">
						<div className="flex items-center justify-between p-12">
							{/* <div className="items-center px-2"> */}
							<div className="flex">
								<Icon color="action">search</Icon>
								<Input
									className="mx-8 w-sm"
									name="name"
									autoComplete="off"
									value={newApplicantForm.name}
									onChange={handleChange}
									// value={searchText}
									// onChange={ev =>
									//     dispatch(
									//         Actions.setApplicantTableSearchText(
									//             ev
									//         )
									//     )
									// }
									placeholder="검색할 출원인을 입력해주십시오."
								/>
								<IconButton
									className="w-32 h-32 mx-4 p-0"
									aria-label="Delete"
									disabled={isFormInValid()}
									type="submit"
								>
									{success ? (
										<Icon fontSize="small">check</Icon>
									) : (
										<Icon fontSize="small">search</Icon>
									)}
								</IconButton>
								<Tooltip title="창 닫기">
									<IconButton
										className="w-32 h-32 mx-4 p-0"
										aria-label="close"
										onClick={ev => dispatch(toggleApplicantClickAway(applicantClickAwayOpen))}
									>
										<Icon fontSize="small">close</Icon>
									</IconButton>
								</Tooltip>
								{loading && <CircularProgress size={32} />}
							</div>
							{/* <div className="flex items-center justify-start">
                                <Button
                                    onClick={() => {
                                        dispatch(
                                            Actions.toggleApplicantClickAway(
                                                applicantClickAwayOpen
                                            )
                                        );
                                    }}
                                    className="md:mx-2"
                                    variant="outlined"
                                    size="small"
                                >
                                    <span className="hidden sm:flex">
                                        초기화
                                    </span>
                                    <Icon
                                        className="flex sm:hidden"
                                        fontSize="small"
                                    >
                                        refresh
                                    </Icon>
                                </Button>
                                <Button
                                    className="md:mr-2"
                                    variant="contained"
                                    size="small"
                                    color="secondary"
                                    // onClick={() => {
                                    //     dispatch(doSearch());
                                    // }}
                                >
                                    <span className="hidden sm:flex">
                                        검색식 적용
                                    </span>
                                    <Icon
                                        className="flex sm:hidden"
                                        fontSize="small"
                                    >
                                        check
                                    </Icon>
                                </Button>
                            </div> */}
						</div>
					</div>
				</form>
				{/* <ApplicantMTable /> */}
				<ApplicantMTable />
				{/* <ApplicantTable /> */}
			</Paper>
		</ClickAwayListener>
	);
}
export default withReducer('searchApp', reducer)(ApplicantMenu);
// export default ApplicantMenu;
