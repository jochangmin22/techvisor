import { TextFieldFormsy } from '@fuse/core/formsy';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { getRegisterToken, submitRegister } from 'app/auth/store/registerSlice';
import Formsy from 'formsy-react';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDeepCompareEffect } from '@fuse/hooks';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'transparent',
		backgroundImage: "url('/assets/images/backgrounds/banner.jpg')",
		backgroundSize: 'cover',
		backgroundPosition: '0 50%',
		backgroundRepeat: 'no-repeat',
		minHeight: '100vh',
		position: 'relative',
		'&.overlay': {
			'&::before': {
				position: 'absolute',
				content: '""',
				height: '100%',
				width: '100%',
				top: 0,
				left: 0,
				background: '#1f2749',
				opacity: '.8'
			}
		}
	},
	inputed: {
		boxSizing: 'border-box',
		cursor: 'pointer',
		// height: '39px',
		borderWidth: '0',
		borderStyle: 'solid',
		borderColor: 'rgba(255, 255, 255, 0)',
		borderImage: 'initial',
		borderRadius: '5px',
		outline: 'none !important',
		// padding: '9px 32px 9px 8px',
		marginBottom: '16px',
		transition: 'background-color 0.2s ease-in-out 0s, border-color 0.2s ease-in-out 0s'
	},
	buttonProgress: {
		color: theme.palette.primary.light,
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -58,
		marginLeft: -48
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

	useDeepCompareEffect(() => {
		/**
		 * Get refreshToken
		 */
		dispatch(getRegisterToken(routeParams.code));
	}, [dispatch, routeParams.code]);

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
		<div
			className={clsx(
				classes.root,
				'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32 overlay'
			)}
		>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<Typography variant="h6" className="mt-16 mb-32">
								가입하여 계정 만들기
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
								<div className="text-xs">
									가입하면{' '}
									<Link to="/policy/terms" target="_blank">
										TechVisor 이용 약관
									</Link>
									에 동의하고{' '}
									<Link to="/policy/privacy" target="_blank">
										개인정보 보호정책
									</Link>
									을 인정한 것으로 간주됩니다.
								</div>
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
							<div className="my-32 flex items-center justify-center">
								<Divider className="w-32" />
								<span className="mx-8 font-medium">또는</span>
								<Divider className="w-32" />
							</div>
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
