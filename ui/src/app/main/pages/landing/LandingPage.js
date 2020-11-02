import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import React from 'react';
import MessageBox from './message-box';
// import TextStepper from './text-stepper';

// import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'black',
		color: theme.palette.primary.contrastText
	},
	leftSection: {
		background: 'transparent'
	},
	rightSection: {
		background: `linear-gradient(to right, ${theme.palette.primary.dark} 0%, ${darken(
			theme.palette.primary.dark,
			0.5
		)} 100%)`,
		color: theme.palette.primary.contrastText
	}
}));

function LandingPage() {
	const classes = useStyles();
	const videoSource = 'assets/videos/main_bg_video.mp4';

	return (
		<>
			<div
				className={clsx(
					classes.root,
					'flex flex-col flex-auto items-center justify-center flex-shrink-0 w-full h-screen'
				)}
			>
				<video
					className="absolute w-full h-screen top-0 left-0 object-cover opacity-50"
					autoPlay
					loop
					muted
					playsInline
				>
					<source src={videoSource} type="video/mp4" />
					Your browser does not support the video tag.
				</video>

				<div className="absolute top-0 flex w-full max-w-2xl md:max-w-3xl overflow-hidden">
					<div
						className={clsx(classes.leftSection, 'hidden md:flex flex-1 items-center justify-center p-64')}
					>
						<div className="max-w-lg">
							<FuseAnimate animation="transition.slideUpIn" delay={1000}>
								<div className="flex w-full flex-col items-center justify-center mb-136">
									<Typography variant="h1" color="inherit" className="font-800 leading-tight">
										Tech Visor
									</Typography>
									<Typography variant="h3" color="inherit" className="font-800 leading-tight">
										AI 기반 IP-비지니스 분석 플랫폼
									</Typography>
								</div>
							</FuseAnimate>

							<MessageBox />
							{/* <TextStepper /> */}
							<div className="flex flex-row m-auto items-center justify-center mt-192">
								<div className="flex p-24 mr-24 w-288 rounded-lg cursor-pointer items-center justify-center bg-blue-600 hover:bg-blue-500 text-20">
									시작하기 <Icon>arrow_forward</Icon>
								</div>
								<div className="flex p-24 w-288 rounded-lg cursor-pointer items-center justify-center hover:bg-blue-500 active:bg-blue-600 transition duration-300 ease-in-out border border-blue-400 hover:text-white text-20">
									더 알아보기 <Icon>arrow_forward</Icon>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* <section id="bars" className="mx-auto flex flex-wrap items-center">
				<div className="text-center w-full">
					<h1 className="my-0 text-4xl sm:text-5xl md:text-6xl">Skills</h1>

					<h2 className="font-light mt-0">I am really good at the following technical skills</h2>
				</div>
				<div className="w-full flex flex-col">
					<div className="mt-8">
						<img
							className="mx-auto h-32"
							src="https://themes.gohugo.io//theme/hugo-theme-pico/icons/precision.svg"
							alt="Precision icon"
						/>

						<h2 className="inline-block">Precision</h2>
						<div className="flex items-center">
							<div className="h-4 flex-1 mr-4 shadow-2 rounded-sm bg-gray-200">
								<div
									className="h-full bg-green-300 rounded-sm"
									style={{
										width: '95%',
										background:
											'radial-gradient( circle farthest-corner at 0.8% 3.1%,  rgba(255,188,224,1) 0%, rgba(170,165,255,1) 46%, rgba(165,255,205,1) 100.2% )'
									}}
								></div>
							</div>
							<span className="font-bold">95%</span>
						</div>
					</div>

					<div className="mt-8">
						<img
							className="mx-auto h-32"
							src="https://themes.gohugo.io//theme/hugo-theme-pico/icons/heat.svg"
							alt="Heat Control icon"
						/>

						<h2 className="inline-block">Heat Control</h2>
						<div className="flex items-center">
							<div className="h-4 flex-1 mr-4 shadow-2 rounded-sm bg-gray-200">
								<div
									className="h-full bg-green-300 rounded-sm"
									style={{
										width: '90%',
										background:
											'radial-gradient( circle farthest-corner at 0.8% 3.1%,  rgba(255,188,224,1) 0%, rgba(170,165,255,1) 46%, rgba(165,255,205,1) 100.2% )'
									}}
								></div>
							</div>
							<span className="font-bold">90%</span>
						</div>
					</div>

					<div className="mt-8">
						<img
							className="mx-auto h-32"
							src="https://themes.gohugo.io//theme/hugo-theme-pico/icons/chicken.svg"
							alt="Quality of Food icon"
						/>

						<h2 className="inline-block">Quality of Food</h2>
						<div className="flex items-center">
							<div className="h-4 flex-1 mr-4 shadow-2 rounded-sm bg-gray-200">
								<div
									className="h-full bg-green-300 rounded-sm"
									style={{
										width: '87%',
										background:
											'radial-gradient( circle farthest-corner at 0.8% 3.1%,  rgba(255,188,224,1) 0%, rgba(170,165,255,1) 46%, rgba(165,255,205,1) 100.2% )'
									}}
								></div>
							</div>
							<span className="font-bold">87%</span>
						</div>
					</div>

					<div className="mt-8">
						<img
							className="mx-auto h-32"
							src="https://themes.gohugo.io//theme/hugo-theme-pico/icons/presentation.svg"
							alt="Presentation icon"
						/>

						<h2 className="inline-block">Presentation</h2>
						<div className="flex items-center">
							<div className="h-4 flex-1 mr-4 shadow-2 rounded-sm bg-gray-200">
								<div
									className="h-full bg-green-300 rounded-sm"
									style={{
										width: '75%',
										background:
											'radial-gradient( circle farthest-corner at 0.8% 3.1%,  rgba(255,188,224,1) 0%, rgba(170,165,255,1) 46%, rgba(165,255,205,1) 100.2% )'
									}}
								></div>
							</div>
							<span className="font-bold">75%</span>
						</div>
					</div>
				</div>
			</section>
			<section className="bar background-gray no-mb">
				<div className="container">
					<div className="row">
						<div className="col-md-12">
							<div className="heading text-center">
								<h2>Our Clients</h2>
							</div>

							<p className="lead"></p>

							<ul className="owl-carousel customers owl-theme">
								<div className="owl-wrapper-outer">
									<div className="owl-wrapper">
										<div className="owl-item w-200">
											<li className="item" title="customer-1">
												<a href="http://www.customer1.com" target="_blank">
													<img
														src="img/clients/customer-1.png"
														alt="customer-1"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
										<div className="owl-item w-200">
											<li className="item" title="customer-2">
												<a href="http://www.customer2.com" target="_blank">
													<img
														src="img/clients/customer-2.png"
														alt="customer-2"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
										<div className="owl-item w-200">
											<li className="item" title="customer-3">
												<a href="http://www.customer3.com" target="_blank">
													<img
														src="img/clients/customer-3.png"
														alt="customer-3"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
										<div className="owl-item w-200">
											<li className="item" title="customer-4">
												<a href="http://www.customer4.com" target="_blank">
													<img
														src="img/clients/customer-4.png"
														alt="customer-4"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
										<div className="owl-item w-200">
											<li className="item" title="customer-5">
												<a href="http://www.customer5.com" target="_blank">
													<img
														src="img/clients/customer-5.png"
														alt="customer-5"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
										<div className="owl-item w-200">
											<li className="item" title="customer-6">
												<a href="http://www.customer6.com" target="_blank">
													<img
														src="img/clients/customer-6.png"
														alt="customer-6"
														className="img-responsive"
													/>
												</a>
											</li>
										</div>
									</div>
								</div>

								<div className="owl-controls clickable">
									<div className="owl-pagination">
										<div className="owl-page active">
											<span className=""></span>
										</div>
										<div className="owl-page">
											<span className=""></span>
										</div>
									</div>
								</div>
							</ul>
						</div>
					</div>
				</div>
			</section>
			<footer id="footer">
				<div class="container">
					<div class="col-md-4 col-sm-6">
						<h4>About us</h4>

						<p>
							Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
							egestas.
						</p>

						<hr class="hidden-md hidden-lg hidden-sm" />
					</div>

					<div class="col-md-4 col-sm-6">
						<h4>Recent posts</h4>

						<div class="blog-entries"></div>

						<hr class="hidden-md hidden-lg" />
					</div>

					<div class="col-md-4 col-sm-6">
						<h4>Contact</h4>

						<p class="text-uppercase">
							<strong>Universal Ltd.</strong>
							<br />
							13/25 New Avenue
							<br />
							Newtown upon River
							<br />
							45Y 73J
							<br />
							England
							<br />
							<strong>Great Britain</strong>
						</p>

						<a
							href="https://themes.gohugo.io//theme/hugo-universal-theme/contact"
							class="btn btn-small btn-template-main"
						>
							Go to contact page
						</a>

						<hr class="hidden-md hidden-lg hidden-sm" />
					</div>
				</div>
			</footer> */}
			{/* <div id="copyright" className="bg-gray-900 text-gray-200 py-52 text-12 leading-loose">
				<div className="flex m-auto px-12">
					<div class="flex flex-row m-auto">
						<p class="mr-16">Copyright (c) Btowin Partners; all rights reserved.</p>

						<p class="mr-16">
							<a href="#" target="_blank" rel="noopener noreferrer">
								서비스 이용약관
							</a>
						</p>
						<p>
							<a href="#" target="_blank" rel="noopener noreferrer">
								개인정보 처리 방침
							</a>
						</p>
					</div>
				</div>
			</div> */}
		</>
	);
}

export default LandingPage;
