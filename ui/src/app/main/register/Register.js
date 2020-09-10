import { TextFieldFormsy } from '@fuse/core/formsy';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Icon from '@material-ui/core/Icon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { submitRegister } from 'app/auth/store/registerSlice';
import Formsy from 'formsy-react';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useDeepCompareEffect } from '@fuse/hooks';

const useStyles = makeStyles(theme => ({
	root: {
		background: `radial-gradient(${darken(theme.palette.primary.dark, 0.5)} 0%, ${theme.palette.primary.dark} 80%)`,
		color: theme.palette.primary.contrastText
	}
}));

function Register() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const routeParams = useParams();
	const register = useSelector(({ auth }) => auth.register);

	const [isFormValid, setIsFormValid] = useState(false);
	// eslint-disable-next-line
	const [fixedEmail, setFixedEmail] = useState(false);
	const formRef = useRef(null);

	// useDeepCompareEffect(() => {
	// 	/**
	// 	 * Get refreshToken
	// 	 */
	// 	dispatch(getRegisterToken(routeParams.code));
	// }, [dispatch, routeParams.code]);

	useEffect(() => {
		if (
			register.error &&
			(register.error.username || register.error.password || register.error.email || register.error.code)
		) {
			// code is not a formsy element, so delete it
			const { code: _, ..._error } = register.error;
			formRef.current.updateInputsWithError({ ..._error });
			disableButton();
		}
	}, [register.error]);

	function disableButton() {
		setIsFormValid(false);
	}

	function enableButton() {
		setIsFormValid(true);
	}

	function handleSubmit(model) {
		dispatch(submitRegister(model, routeParams.code));
	}

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-32">
							{/* <img className="w-128 m-32" src="assets/images/logos/logo_line.svg" alt="logo" /> */}

							<Typography variant="h6" className="mt-16 mb-32">
								회원 가입
							</Typography>
							<Formsy
								onValidSubmit={handleSubmit}
								onValid={enableButton}
								onInvalid={disableButton}
								ref={formRef}
								className="flex flex-col justify-center w-full"
							>
								<TextFieldFormsy
									className="mb-16"
									type="text"
									name="displayName"
									label="이름"
									validations={{
										minLength: 2
									}}
									validationErrors={{
										minLength: '길이가 2글자 이상이여야 합니다'
									}}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<Icon className="text-20" color="action">
													person
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									required
								/>

								<TextFieldFormsy
									className="mb-16"
									type="text"
									name="email"
									label="이메일"
									// value={fixedEmail ? false : true}
									validations="isEmail"
									validationErrors={{
										isEmail: '이메일 형식이 맞지 않습니다'
									}}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<Icon className="text-20" color="action">
													email
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									required={fixedEmail ? false : true}
									disabled={fixedEmail ? true : false}
								/>

								<TextFieldFormsy
									className="mb-16"
									type="password"
									name="password"
									label="비밀번호"
									validations={{
										minLength: 4
									}}
									validationErrors={{
										minLength: '길이가 4글자 이상이여야 합니다'
									}}
									// validations="equalsField:password-confirm"
									// validationErrors={{
									// 	equalsField: '비밀번호가 일치하지 않습니다'
									// }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<Icon className="text-20" color="action">
													vpn_key
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									required
								/>

								<TextFieldFormsy
									className="mb-16"
									type="password"
									name="password-confirm"
									label="비밀번호 확인"
									validations="equalsField:password"
									validationErrors={{
										equalsField: '비밀번호가 일치하지 않습니다'
									}}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<Icon className="text-20" color="action">
													vpn_key
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									required
								/>
								<Alert
									className={clsx(register.error && register.error.code ? 'flex' : 'hidden')}
									severity="error"
								>
									잘못된 인증메일 입니다. 인증메일을 다시 받으십시오
								</Alert>

								<Button
									type="submit"
									variant="contained"
									color="primary"
									className="w-full mx-auto mb-32 normal-case"
									aria-label="가입"
									disabled={!isFormValid}
									value="legacy"
								>
									다음
								</Button>
							</Formsy>

							{/* <div className="flex flex-col items-center justify-center pt-32 pb-24">
								<span className="font-medium text-12 pb-8">이미 계정이 있나요?</span>
								<Link className="font-medium text-12 mb-8" to="/login">
									로그인
								</Link>
							</div> */}
							<Link className="font-medium mb-32" to="/">
								취소
							</Link>
						</CardContent>
					</Card>
				</FuseAnimate>
				<div className="flex flex-row items-center justify-center pt-32 pb-24">
					<span className="font-light text-12 pr-8">이미 계정이 있나요?</span>
					<Link className="font-medium text-12" to="/login">
						로그인
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Register;
