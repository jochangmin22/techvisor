import FuseAnimate from '@fuse/core/FuseAnimate';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Formsy from 'formsy-react';
import TextFieldFormsy from '@fuse/core/formsy/TextFieldFormsy';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { submitEmail } from 'app/auth/store/loginSlice';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
		},
		'& .footer': {
			'& ul': {
				'& li:not(:first-child)': {
					'&::before': {
						content: '•',
						margin: '0px 8px'
					}
				}
			}
		},
		'& .buttonProgress': {
			color: theme.palette.primary.light,
			position: 'absolute',
			top: '50%',
			left: '50%',
			marginTop: -12,
			marginLeft: -12
		}
	}
}));

function ResetPassword(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const login = useSelector(({ auth }) => auth.login);
	const [isFormValid, setIsFormValid] = useState(false);
	const [email, setEmail] = useState(String(props.match.params.email));
	const [signedIn, setSigned] = useState(null);
	const [showLoading, setShowLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const formRef = useRef(null);

	useLayoutEffect(() => {
		if (Object.values(login.error).every(k => k !== null && k !== '')) {
			setIsError(true);
			// formRef.current.updateInputsWithError({
			// 	...login.error
			// });
			disableButton();
		}
	}, [login.error]);

	useEffect(() => {
		if (login.signedIn !== null) {
			setSigned(login.signedIn);
			disableButton();
		}
	}, [login.signedIn]);

	function disableButton() {
		setIsFormValid(false);
	}

	function enableButton() {
		setIsFormValid(true);
	}

	function handleClick(event) {
		event.preventDefault();
		setSigned(null);
	}

	function handleSubmit(model) {
		setShowLoading(true);
		setEmail(model.email);
		dispatch(submitEmail(model)).then(() => {
			setShowLoading(false);
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
							<div className="text-16 font-medium mb-24">로그인할 수 없습니까?</div>
							{signedIn ? (
								<>
									<img
										src="assets/images/illustrations/mail_sent.svg"
										className="w-1/2 h-1/2 p-4 mb-16"
										alt="mail sent"
									/>
									<div className="text-14 mb-16">복구 링크를 다음 이메일 주소로 보냈습니다.</div>
									<div className="text-14 font-medium mb-16">{email}</div>
								</>
							) : (
								<>
									<div className="text-14 mb-16">복구 링크가 다음 이메일 주소로 전송됩니다.</div>
									<Collapse in={isError}>
										<div
											className={clsx(
												isError ? 'flex' : 'hidden',
												'shadow-8 rounded-8 mb-24 p-16'
											)}
										>
											<ul>
												<li>잘못된 이메일 주소 및/또는 비밀번호입니다.</li>
												<li>
													<Link to="/resetpassword">로그인</Link>하는 데 도움이 필요하세요?
												</li>
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
											label="이메일 입력"
											value={email}
											validations={{
												isEmail: true
											}}
											validationErrors={{
												isEmail: '이메일 형식이 맞지 않습니다'
											}}
											variant="outlined"
											required
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
											복구 링크 보내기
										</Button>
										{showLoading && <CircularProgress size={24} className="buttonProgress" />}
									</Formsy>
								</>
							)}
							<Divider className="card-divider w-full my-32" />
							<div className="footer">
								<ul className="flex flex-1 justify-center">
									<li>
										<Link className="font-medium mb-32 mr-16" to="/login">
											로그인으로 돌아기기
										</Link>
									</li>
									{signedIn && (
										<li>
											<Link to={`/login/reset-password/${email}`} onClick={handleClick}>
												복구 링크 다시 보내기
											</Link>
										</li>
									)}
								</ul>
							</div>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default ResetPassword;
