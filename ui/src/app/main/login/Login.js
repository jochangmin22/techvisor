import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Formsy from 'formsy-react';
import TextFieldFormsy from '@fuse/core/formsy/TextFieldFormsy';
import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { submitPassword, submitEmail, resetLogin } from 'app/auth/store/loginSlice';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GoogleLogin from 'react-google-login';
import NaverLogin from 'react-naver-login';

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

const callbackUrl = `${process.env.REACT_APP_API_URL}/login`;

/* signedIn = null (시작), false (db 없음), true (db 있음) */

function Login() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const routeParams = useParams();
	const login = useSelector(({ auth }) => auth.login);
	const [isFormValid, setIsFormValid] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [start, setStart] = useState(true);
	const [signedIn, setSigned] = useState(null);
	const [isError, setIsError] = useState(false);
	const [mode, setMode] = useState('LOGIN');
	const [showLoading, setShowLoading] = useState(false);
	const [email, setEmail] = useState(routeParams.email ? routeParams.email : null);
	const formRef = useRef(null);

	useLayoutEffect(() => {
		if (Object.values(login.error).some(k => k !== null && k !== '')) {
			setIsError(true);
			formRef.current.updateInputsWithError({
				...login.error
			});
			disableButton();
		}
	}, [login.error]);

	useEffect(() => {
		if (login.signedIn !== null) {
			setStart(false);
			setSigned(login.signedIn);
			disableButton();
		}
	}, [login.signedIn, setStart]);

	useEffect(() => {}, [setMode]);

	function disableButton() {
		setIsFormValid(false);
	}

	function enableButton() {
		setIsFormValid(true);
	}

	function handleReset() {
		setStart(true);
		setSigned(null);
		setIsError(false);
		dispatch(resetLogin());
		setShowLoading(false);
	}

	function handleSubmit(model) {
		setEmail(model.email);
		setShowLoading(true);
		if (start) {
			dispatch(submitEmail(model)).then(res => {
				if (res.payload === false) {
					dispatch(
						showMessage({
							message: '이메일을 보냈습니다. 확인 이메일이 곧 도착할 것입니다.',
							autoHideDuration: 10000,
							anchorOrigin: {
								vertical: 'bottom',
								horizontal: 'left'
							},
							variant: 'success'
						})
					);
				}
				setShowLoading(false);
			});
			disableButton();
		} else {
			setIsError(false);
			dispatch(submitPassword(model)).then(res => {
				if (res.payload) {
					setShowLoading(false);
				}
			});
			disableButton();
		}
	}
	const responseGoogle = response => {
		console.log(response);
	};

	const text = mode === 'REGISTER' ? '회원가입' : '로그인';

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
							<Typography variant="h6" className="my-16">
								{text}
							</Typography>
							<Collapse in={isError}>
								<div className={clsx(isError ? 'flex' : 'hidden', 'shadow-8 rounded-8 mb-24 p-16')}>
									<ul>
										<li>잘못된 이메일 주소 및/또는 비밀번호입니다.</li>
										<li>
											<Link to={`/reset-password/${email}`}>{text}</Link>
											하는 데 도움이 필요하세요?
										</li>
									</ul>
								</div>
							</Collapse>
							<Collapse in={signedIn === false}>
								<div
									className={clsx(
										signedIn === false ? 'flex' : 'hidden',
										'shadow-8 rounded-8 mb-24 p-16'
									)}
								>
									<ul className="mb-8">
										<li>아직 계정이 없으시군요?</li>
										<li>가입 링크를 아래의 메일주소로 보냈습니다.</li>
										<li className="text-14 font-medium mb-8">{email}</li>
									</ul>
								</div>
							</Collapse>
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
									value={email}
									label={'이메일로 ' + text}
									validations={{
										isEmail: true
									}}
									validationErrors={{
										isEmail: '이메일 형식이 맞지 않습니다'
									}}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												{signedIn !== null && (
													<Icon className="text-20" color="action">
														create
													</Icon>
												)}
											</InputAdornment>
										)
									}}
									onFocus={handleReset}
									variant={signedIn === null ? 'outlined' : 'standard'}
									// required={isEmailExists ? false : true}
									required={start}
								/>
								{/* signedIn = null (시작), false (없어서 발송), true (있어서 암호) */}
								<Collapse in={signedIn}>
									<TextFieldFormsy
										className={signedIn === true ? 'flex' : 'hidden'}
										type="password"
										name="password"
										label="비밀번호"
										validations={{
											minLength: 4
										}}
										validationErrors={{
											minLength: '길이가 4글자 이상이여야 합니다'
										}}
										InputProps={{
											className: 'pr-2',
											type: showPassword ? 'text' : 'password',
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={() => setShowPassword(!showPassword)}>
														<Icon className="text-20" color="action">
															{showPassword ? 'visibility' : 'visibility_off'}
														</Icon>
													</IconButton>
												</InputAdornment>
											)
										}}
										variant="outlined"
										// required={isEmailExists ? true : false}
										required={signedIn === true}
									/>
								</Collapse>
								<Button
									type="submit"
									variant="contained"
									color="primary"
									className="w-full mx-auto mt-16 normal-case"
									aria-label="LOG IN"
									disabled={!isFormValid || signedIn === false}
									value="legacy"
								>
									다음
								</Button>
								{showLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
							</Formsy>
							<div className="my-32 flex items-center justify-center">
								<Divider className="w-32" />
								<span className="mx-8 font-medium">또는</span>
								<Divider className="w-32" />
							</div>
							<GoogleLogin
								clientId={process.env.REACT_APP_GOOGLE_ID}
								// buttonText={'구글 계정으로 ' + text}
								onSuccess={responseGoogle}
								onFailure={responseGoogle}
								render={renderProps => (
									<Button
										variant="outlined"
										color="default"
										size="small"
										style={{ textAlign: 'left' }}
										className="font-medium normal-case justify-start w-192 mb-8"
										startIcon={
											<Avatar
												variant="square"
												className="w-24 h-24"
												src={'/assets/images/logos/google_dark.svg'}
											/>
										}
										onClick={renderProps.onClick}
										disabled
									>
										구글 계정으로 {text}
									</Button>
								)}
								cookiePolicy={'single_host_origin'}
							/>
							<NaverLogin
								clientId={process.env.REACT_APP_NAVER_ID}
								callbackUrl={callbackUrl}
								// render={props => <div onClick={props.onClick}>Naver Login</div>}
								render={props => (
									<Button
										variant="outlined"
										color="default"
										size="small"
										className="font-medium normal-case justify-start w-192 mb-32"
										startIcon={
											<Avatar
												variant="square"
												className="w-24 h-24"
												src={'/assets/images/logos/naver_dark.svg'}
											/>
										}
										onClick={props.onClick}
										disabled
									>
										네이버 계정으로 {text}
									</Button>
								)}
								onSuccess={naverUser => console.log(naverUser)}
								// onFailure={() => console.error(result)}
								onFailure={responseGoogle}
							/>
							{/* <Button
								variant="contained"
								color="default"
								size="small"
								className="font-medium normal-case w-192 mb-8"
							>
								구글 계정으로 {text}
							</Button> */}
							{/* <Button
								variant="contained"
								color="default"
								size="small"
								className="font-medium normal-case w-192 mb-32"
							>
								네이버 계정으로 {text}
							</Button> */}
							<Link className="font-medium mb-32" onClick={() => dispatch(resetLogin())} to="/">
								취소
							</Link>
						</CardContent>
					</Card>
				</FuseAnimate>
				{/* episode 454 */}
				{mode === 'LOGIN' ? (
					<div className="flex flex-row items-center justify-center pt-32 pb-24">
						<span className="font-light text-12 pr-8">계정이 없으십니까?</span>
						<div className="font-medium text-12 cursor-pointer" onClick={() => setMode('REGISTER')}>
							회원 가입하기
						</div>
					</div>
				) : (
					<div className="flex flex-row items-center justify-center pt-32 pb-24">
						<span className="font-light text-12 pr-8">이미 계정이 있나요?</span>
						<div className="font-medium text-12 cursor-pointer" onClick={() => setMode('LOGIN')}>
							로그인
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Login;
