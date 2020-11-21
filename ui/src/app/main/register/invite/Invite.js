import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Formsy from 'formsy-react';
import TextFieldFormsy from '@fuse/core/formsy/TextFieldFormsy';
import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { resetRegister, submitRegister } from 'app/auth/store/registerSlice';
import React, { useState, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

function Invite() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const routeParams = useParams();
	const register = useSelector(({ auth }) => auth.register);
	const [isFormValid, setIsFormValid] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isError, setIsError] = useState(false);
	const [showLoading, setShowLoading] = useState(false);
	const [email, setEmail] = useState(routeParams.email ? routeParams.email : null);

	useLayoutEffect(() => {
		if (Object.values(register.error).some(k => k !== null && k !== '')) {
			setIsError(true);
			disableButton();
		}
	}, [register.error]);

	function disableButton() {
		setIsFormValid(false);
	}

	function enableButton() {
		setIsFormValid(true);
	}

	function handleReset() {
		setIsError(false);
		dispatch(resetRegister());
		setShowLoading(false);
	}

	function handleSubmit(model) {
		setEmail(model.email);
		setShowLoading(true);
		setIsError(false);
		dispatch(submitRegister({ ...model, ...routeParams })).then(res => {
			if (res === 'success') {
				setShowLoading(false);
			} else {
				setShowLoading(false);
			}
		});
		disableButton();
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
							<div className="my-16 font-medium text-base">팀에 참가하려면 가입하세요.</div>
							<Collapse in={isError}>
								<div className={clsx(isError ? 'flex' : 'hidden', 'shadow-8 rounded-8 mb-24 p-16')}>
									<ul>
										<li>가입을 시도하는 중에 오류가 발생했습니다. 다시 시도하세요.</li>
										{register.error.email !== '' || register.error.email.length !== 0 ? (
											<>
												<li className="font-semibold">{register.error.email}</li>
												<li>
													<Link to="/login">로그인 화면에서 다시 시도해보세요.</Link>
												</li>
											</>
										) : (
											''
										)}
									</ul>
								</div>
							</Collapse>
							<ul className="mb-16">
								<li className="font-semibold">{email}</li>
								<li>주소로 계정을 만들려면 몇 가지 세부 정보가 필요합니다.</li>
							</ul>
							<Formsy
								onValidSubmit={handleSubmit}
								onValid={enableButton}
								onInvalid={disableButton}
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
									onFocus={() => handleReset}
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
									onFocus={() => handleReset}
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
									onFocus={() => handleReset}
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
								<Button
									type="submit"
									variant="contained"
									color="primary"
									className="w-full mx-auto mt-16 normal-case"
									aria-label="LOG IN"
									disabled={!isFormValid}
									value="legacy"
								>
									다음
								</Button>
								{showLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
							</Formsy>
							<Divider className="card-divider w-full my-32" />
							<Link to="/login">이미 TechVisor 계정이 있으신가요? 로그인</Link>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default Invite;
