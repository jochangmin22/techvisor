import React, { useState } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import NativeSelect from '@material-ui/core/NativeSelect';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
// import clsx from 'clsx';
import _ from '@lodash';
// import * as Actions from 'app/main/apps/search/store/actions';
// import ThsrsModel from "app/main/search/model/ThsrsModel";
const defaultFormState = {
	labels: []
};

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	margin: {
		// margin: theme.spacing(0)
		marginTop: theme.spacing(0),
		marginBotton: theme.spacing(0),
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	selectEmpty: {
		marginTop: theme.spacing(2)
	}
}));

function OptionsForm(props) {
	const dispatch = useDispatch();
	const classes = useStyles(props);
	const searchText = useSelector(({ searchApp }) => searchApp.searchs.searchText);

	const [SearchEl, setSearchEl] = useState(searchText);
	const { form, handleChange2, setForm } = useForm({ ...defaultFormState });

	function handleThsrsChange(event, label) {
		event.stopPropagation();
		setSearchEl(label);
		// setForm(
		//     _.set({
		//         ...form,
		//         labels: label
		//     })
		// );
	}

	const [state, setState] = React.useState({
		checkedA: true,
		checkedB: true,
		checkedC: true,
		checkedD: true,
		checkedE: true,
		checkedF: true,
		checkedG: true,
		checkedH: true,
		checkedI: true,
		checkedJ: true
	});

	const handleChange = name => event => {
		setState({ ...state, [name]: event.target.checked });
	};
	const handleSelectChange = name => event => {
		setState({
			...state,
			[name]: event.target.value
		});
	};

	const [checked, setChecked] = React.useState([0]);

	const handleToggle = value => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);
	};

	return (
		<div className="flex flex-col w-full">
			{/* <FuseScrollbars className="flex flex-auto w-full max-h-640"> */}
			<FuseScrollbars className="flex flex-auto w-full">
				{/* <ThemeProvider theme={theme} className="w-full"> */}
				<div className="w-full text-xs text-gray-700 tracking-tighter font-bold">
					<form
						noValidate
						// onSubmit={handleSubmit}
						className="flex flex-col w-full overflow-hidden"
						autoComplete="off"
					>
						<div className="flex px-6">
							<div className="md:w-1/6 block md:text-left mb-1 md:mb-0 pt-20 pr-4">권리 구분</div>
							<div className="md:w-5/6">
								<div className="md:ml-auto md:w-11/12">
									<FormGroup row>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedA}
													onChange={handleChange('checkedA')}
													value="checkedA"
												/>
											}
											label="특허"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedB}
													onChange={handleChange('checkedB')}
													value="checkedB"
												/>
											}
											label="실용"
										/>
									</FormGroup>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block md:text-left mb-1 md:mb-0 pt-20 pr-4">행정 상태</div>
							<div className="md:w-5/6">
								<div className="md:ml-auto md:w-11/12">
									<FormGroup row>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedC}
													onChange={handleChange('checkedC')}
													value="checkedC"
												/>
											}
											label="전체"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedD}
													onChange={handleChange('checkedD')}
													value="checkedD"
												/>
											}
											label="공개"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedE}
													onChange={handleChange('checkedE')}
													value="checkedE"
												/>
											}
											label="취하"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedF}
													onChange={handleChange('checkedF')}
													value="checkedF"
												/>
											}
											label="소멸"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedG}
													onChange={handleChange('checkedG')}
													value="checkedG"
												/>
											}
											label="포기"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedH}
													onChange={handleChange('checkedH')}
													value="checkedH"
												/>
											}
											label="무효"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedI}
													onChange={handleChange('checkedI')}
													value="checkedI"
												/>
											}
											label="거절"
										/>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={state.checkedJ}
													onChange={handleChange('checkedJ')}
													value="checkedJ"
												/>
											}
											label="등록"
										/>
									</FormGroup>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">자유검색 (전문)</div>
							<div className="flex items-baseline md:w-5/6">
								<div className="md:ml-auto md:w-10/12">
									<TextField
										// className={clsx(
										//     classes.margin,
										//     "flex-initial"
										// )}
										// label="Width"
										margin="dense"
										id="width"
										name="width"
										value={form.kw}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
											// padding: "4"
										}}
										placeholder='ex) 자동차 엔진  (구문으로 검색 할 경우 : "휴대폰케이스" ) '
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionA}
											onChange={handleSelectChange('optionA')}
											name="and/or"
											// className={classes.selectEmpty}
											// className="flex-initial min-w-52 ml-6"
											inputProps={{
												'aria-label': 'optionA'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">IPC</div>
							<div className="flex items-baseline md:w-5/6">
								<div className="md:ml-auto md:w-10/12">
									<TextField
										// className={clsx(
										//     classes.margin,
										//     "flex-initial"
										// )}
										// label="Width"
										margin="dense"
										id="width"
										name="width"
										value={form.ipc}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
										}}
										placeholder="ex) G06Q + H04Q"
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionB}
											onChange={handleSelectChange('optionB')}
											name="and/or"
											// className={clsx(
											//     classes.selectEmpty
											//     // "flex-initial min-w-52 ml-6"
											// )}
											inputProps={{
												'aria-label': 'optionB'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">CPC</div>
							<div className="flex items-baseline md:w-5/6">
								<div className="md:ml-auto md:w-10/12">
									<TextField
										// className={clsx(
										//     classes.margin,
										//     "flex-initial"
										// )}
										// label="Width"
										margin="dense"
										id="width"
										name="width"
										value={form.cpc}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
										}}
										placeholder="ex) G06Q"
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionC}
											onChange={handleSelectChange('optionC')}
											name="and/or"
											// className={clsx(
											//     classes.selectEmpty
											//     // "flex-initial min-w-52 ml-6"
											// )}
											inputProps={{
												'aria-label': 'optionC'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">발명의 명칭</div>
							<div className="flex items-baseline md:w-5/6">
								<div className="md:ml-auto md:w-10/12">
									<TextField
										// className={clsx(
										//     classes.margin,
										//     "flex-initial"
										// )}
										// label="Width"
										margin="dense"
										id="width"
										name="width"
										value={form.tl}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
										}}
										placeholder='ex) 휴대폰 터치스크린, 전자*화폐, "휴대폰케이스"'
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionD}
											onChange={handleSelectChange('optionD')}
											name="and/or"
											// className={clsx(
											//     classes.selectEmpty
											//     // "flex-initial min-w-52 ml-6"
											// )}
											inputProps={{
												'aria-label': 'optionD'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">요약</div>
							<div className="flex items-baseline md:w-5/6">
								<div className="md:ml-auto md:w-10/12">
									<TextField
										margin="dense"
										id="width"
										name="width"
										value={form.ab}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
										}}
										placeholder='ex) 변속 + 클러치, "데이터신호"'
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionE}
											onChange={handleSelectChange('optionE')}
											name="and/or"
											inputProps={{
												'aria-label': 'optionE'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">번호정보</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">출원번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1020150123456"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionF}
												onChange={handleSelectChange('optionF')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionF'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">등록번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1012345670000"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionG}
												onChange={handleSelectChange('optionG')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionG'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>

								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">공개번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1020150123456"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionH}
												onChange={handleSelectChange('optionH')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionH'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">공고번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1012345670000"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionI}
												onChange={handleSelectChange('optionI')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionI'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">국제출원번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1020150123456"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionJ}
												onChange={handleSelectChange('optionJ')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionJ'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">국제공개번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1012345670000"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionK}
												onChange={handleSelectChange('optionK')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionK'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">일자정보</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 self-center block md:text-left">출원일자</div>
									<div className="md:w-2/6">
										<TextField
											name="adFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.adFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="adTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.adTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionE}
												onChange={handleSelectChange('optionL')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionL'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">등록일자</div>
									<div className="md:w-2/6">
										<TextField
											name="gdFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.gdFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="gdTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.gdTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionM}
												onChange={handleSelectChange('optionM')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionM'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">공개일자</div>
									<div className="md:w-2/6">
										<TextField
											name="opdFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.opd_from}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="opdTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.ad_to}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionN}
												onChange={handleSelectChange('optionN')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionN'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">공고일자</div>
									<div className="md:w-2/6">
										<TextField
											name="pdFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.pdFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="gdTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.gdTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionO}
												onChange={handleSelectChange('optionO')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionO'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">국제출원일자</div>
									<div className="md:w-2/6">
										<TextField
											name="fdFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.fdFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="fdTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.fdTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionP}
												onChange={handleSelectChange('optionP')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionP'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">국제공개일자</div>
									<div className="md:w-2/6">
										<TextField
											name="fodFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.fodFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="fodTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.fodTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionQ}
												onChange={handleSelectChange('optionQ')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionQ'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">우선권정보</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">우선권주장번호</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 1020150123456"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionR}
												onChange={handleSelectChange('optionR')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionR'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">우선권주장일자</div>
									<div className="md:w-2/6">
										<TextField
											name="rdFrom"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.rdFrom}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-2/6">
										<TextField
											name="rdTo"
											margin="dense"
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											value={form.rdTo}
											onChange={handleChange}
											variant="outlined"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionS}
												onChange={handleSelectChange('optionS')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionS'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">직접입력</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="md:w-1/12 block self-center md:text-left">청구범위</div>
								<div className="md:w-10/12">
									<TextField
										margin="dense"
										id="width"
										name="width"
										value={form.ab}
										onChange={handleChange}
										variant="outlined"
										fullWidth
										inputProps={{
											autoComplete: 'new-password',
											form: {
												autoComplete: 'off'
											}
										}}
										placeholder='ex) 변속 + 클러치, "데이터신호"'
									/>
								</div>
								<div className="md:w-1/12 md:text-center md:self-center">
									<FormControl>
										<NativeSelect
											value={state.optionT}
											onChange={handleSelectChange('optionT')}
											name="and/or"
											inputProps={{
												'aria-label': 'optionT'
											}}
										>
											<option value="and">or</option>
											<option value="or">and</option>
										</NativeSelect>
									</FormControl>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">이름/번호/주소</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">출원인</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 대한민국, 219990043221, 서울*삼성동"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionU}
												onChange={handleSelectChange('optionU')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionU'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">발명자</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 연구소, 419990384727, 대전*대덕구"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionV}
												onChange={handleSelectChange('optionV')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionV'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>

								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">대리인</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 김철수, 919980000341, 서울*삼성동"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionW}
												onChange={handleSelectChange('optionW')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionW'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">등록권자</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 김철수, 서울*삼성동"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionX}
												onChange={handleSelectChange('optionX')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionX'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
						<div className="flex px-6">
							<div className="md:w-1/6 block self-center md:text-left mb-1 md:mb-0">국가R&D연구정보</div>
							<div className="flex flex-wrap items-baseline md:w-5/6">
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">연구부처명/주관기간명</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) 국방부"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionY}
												onChange={handleSelectChange('optionY')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionY'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
								<div className="flex items-baseline md:w-1/2">
									<div className="md:w-1/6 block self-center md:text-left">연구사업명/연구과제명</div>
									<div className="md:w-4/6">
										<TextField
											margin="dense"
											id="width"
											name="width"
											value={form.ab}
											onChange={handleChange}
											variant="outlined"
											fullWidth
											inputProps={{
												autoComplete: 'new-password',
												form: {
													autoComplete: 'off'
												}
											}}
											placeholder="ex) IT 신성장동력 핵심기술개발사업"
										/>
									</div>
									<div className="md:w-1/6 md:text-center md:self-center">
										<FormControl>
											<NativeSelect
												value={state.optionZ}
												onChange={handleSelectChange('optionZ')}
												name="and/or"
												inputProps={{
													'aria-label': 'optionZ'
												}}
											>
												<option value="and">or</option>
												<option value="or">and</option>
											</NativeSelect>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</FuseScrollbars>
		</div>
	);
}

export default OptionsForm;
