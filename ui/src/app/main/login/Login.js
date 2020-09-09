import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import Formsy from 'formsy-react';
import TextFieldFormsy from '@fuse/core/formsy/TextFieldFormsy';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { submitLogin, submitLoginEmail } from 'app/auth/store/loginSlice';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import GoogleLogin from 'react-google-login';
import NaverLogin from 'react-naver-login';

const useStyles = makeStyles(theme => ({
	root: {
		background: `radial-gradient(${darken(theme.palette.primary.dark, 0.5)} 0%, ${theme.palette.primary.dark} 80%)`,
		color: theme.palette.primary.contrastText
	},
	buttonProgress: {
		color: theme.palette.primary.light,
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -58,
		marginLeft: -48
	},
	pointBackground: { color: theme.palette.primary.contrastText, backgroundColor: theme.palette.primary.light }
}));

function Login() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const login = useSelector(({ auth }) => auth.login);

	const [isFormValid, setIsFormValid] = useState(false);
	const [start, setStart] = useState(true);
	const [signedIn, setSigned] = useState(null);
	const [mode, setMode] = useState('LOGIN');
	const [showLoading, setShowLoading] = useState(false);

	const formRef = useRef(null);

	useEffect(() => {
		// if (login.error && (login.error.email || login.error.password)) {
		if (login.error && login.error.password) {
			formRef.current.updateInputsWithError({
				...login.error
			});
			disableButton();
		}
	}, [login.error]);

	useEffect(() => {
		// if (login.signedIn !== null) {
		// 	setStart(false);
		// }
		if (login.signedIn === true || login.signedIn === false) {
			setStart(false);
			setSigned(login.signedIn);
		}
	}, [login.signedIn, setStart]);

	useEffect(() => {}, [setMode]);

	function disableButton() {
		setIsFormValid(false);
	}

	function enableButton() {
		setIsFormValid(true);
	}

	function handleSubmit(model) {
		setShowLoading(true);
		if (start) {
			dispatch(submitLoginEmail(model)).then(() => {
				setShowLoading(false);
			});
		} else {
			dispatch(submitLogin(model));
			setShowLoading(false);
		}
	}
	const responseGoogle = response => {
		console.log(response);
	};

	const text = mode === 'REGISTER' ? '회원가입' : '로그인';

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-32">
							{/* <img className="w-128 m-32" src="assets/images/logos/logo_line.svg" alt="logo" /> */}
							{/* <img className="w-128 m-32" src="assets/images/logos/logo_temp.png" alt="logo" />*/}
							<Typography variant="h6" className="my-16">
								{text}
							</Typography>
							{/* <Typography variant="subtitle1" className="flex items-left my-4">
								이메일로 로그인
							</Typography> */}
							<Formsy
								onValidSubmit={handleSubmit}
								onValid={enableButton}
								onInvalid={disableButton}
								ref={formRef}
								className="flex flex-col justify-center w-full"
							>
								<TextFieldFormsy
									className={start ? '' : 'hidden'}
									type="text"
									name="email"
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
												<Icon className="text-20" color="action">
													email
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									// required={isEmailExists ? false : true}
									required={start}
								/>
								{/* 시작 signedIn = null, 없어서 발송 signedIn= false, 있어서 암호 signedIn= true */}
								<Alert className={clsx(signedIn === false ? 'flex' : 'hidden')} severity="success">
									{signedIn ? '로그인' : '회원가입'} 링크가 이메일로 전송되었습니다.
									<br />
									이메일의 링크를 통하여 {signedIn ? '로그인' : '회원가입'}을 계속하세요.
								</Alert>
								<TextFieldFormsy
									className={signedIn === true ? '' : 'hidden'}
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
										endAdornment: (
											<InputAdornment position="end">
												<Icon className="text-20" color="action">
													vpn_key
												</Icon>
											</InputAdornment>
										)
									}}
									variant="outlined"
									// required={isEmailExists ? true : false}
									required={signedIn === true}
								/>
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
							<div
								className={clsx(
									'flex flex-col items-center justify-center pt-16 hidden',
									signedIn === true ? '' : 'hidden'
								)}
							>
								<Link className="font-medium text-12" to="/forgot-password">
									비밀번호 찾기
								</Link>
							</div>
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
									>
										구글 계정으로 {text}
									</Button>
								)}
								cookiePolicy={'single_host_origin'}
							/>
							<NaverLogin
								clientId={process.env.REACT_APP_NAVER_ID}
								callbackUrl="http://192.168.0.40:3000/login"
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
							<Link className="font-medium mb-32" to="/">
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
