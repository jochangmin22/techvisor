import React from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Typography from '@material-ui/core/Typography';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './MessageBox.css';

const tutorialSteps = [
	{
		textA: '방대한 양의 특허를 빠르게 분석하여',
		textB: '내가 원하는 주제의 기술트렌드를',
		textC: '간편하게 확인할 수 있습니다.'
	},
	{
		textA: '관심 키워드 입력만으로',
		textB: '관련 기업을 찾고',
		textC: '해당 기업의 R&D역량을 파악하세요.'
	},
	{
		textA: '아직도 개별종목의 적정주가를 일일히 계산하시나요?',
		textB: 'Tech-Visor는 상장된 모든 기업의 재무분석을 통해',
		textC: '매일매일 변화하는 적정주가를 분석하여 제공합니다.'
	},
	{
		textA: '관심 기업을 나만의 포트폴리오에 담아',
		textB: '뉴스, 공시, 임상, 특허정보를 빠르게 확인하여',
		textC: '투자의사결정에 활용할 수 있습니다.'
	}
];

function MessageBox() {
	const settings = {
		dots: true,
		// dotsClass: 'slick-dots slick-thumb',
		// dotsClass: { style: {.button__bar : li.slick-active button {
		// 	opacity: .75;
		// 	color: #000
		// }}},
		pauseOnHover: true,
		fade: true,
		// appendDots: dots => (
		// 	<div className="bg-transparent">
		// 		<ul className="m-4">{dots}</ul>
		// 	</div>
		// ),
		// customPaging: function (i) {
		// 	return (
		// 		<div className="cursor-pointer bg-white hover:bg-blue-500 transition-all ease-in duration-300 rounded-8 w-12 h-12"></div>
		// 	);
		// },
		infinite: true,
		speed: 100,
		autoplay: true,
		autoplaySpeed: 6000,
		slidesToShow: 1,
		slidesToScroll: 1
	};

	return (
		<FuseAnimate animation="transition.fadeIn" delay={1500}>
			<Slider {...settings}>
				{tutorialSteps.map((step, index) => (
					<div key={index} className="flex w-full flex-col items-center justify-center">
						<Typography
							variant="h5"
							color="inherit"
							className="text-center leading-loose text-14 md:text-16"
						>
							<p>{step.textA}</p>
							<p>{step.textB}</p>
							<p>{step.textC}</p>
						</Typography>
					</div>
				))}
			</Slider>
		</FuseAnimate>
	);
}

export default MessageBox;
