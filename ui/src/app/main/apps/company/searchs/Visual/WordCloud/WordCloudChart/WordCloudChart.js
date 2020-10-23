import React, { useRef, useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import 'echarts-wordcloud';
import echarts from 'echarts';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useSelector, useDispatch } from 'react-redux';
import { getWordCloud } from 'app/main/apps/company/store/searchsSlice';
import debounce from 'lodash/debounce';
import randomColor from 'randomcolor';
import WordCloudMenu from '../WordCloudMenu';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

function WordCloudChart() {
	const dispatch = useDispatch();
	const chartRef = useRef(null);
	const ownedPatent = useSelector(({ companyApp }) => companyApp.searchs.ownedPatent);
	const entities = useSelector(({ companyApp }) => companyApp.searchs.wordCloud);
	const menuOptions = useSelector(({ companyApp }) => companyApp.searchs.menuOptions);
	const corpName = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp.corpName);
	const [showLoading, setShowLoading] = useState(false);
	const [echart, setEchart] = useState(null);

	useEffect(() => {
		setShowLoading(true);

		const params = {
			params: { corpName: corpName || '' },
			subParams: { menuOptions: menuOptions }
		};
		if (ownedPatent && ownedPatent.length > 0) {
			dispatch(getWordCloud(params)).then(() => {
				setShowLoading(false);
			});
		}

		// eslint-disable-next-line
	}, [menuOptions.wordCloudOptions, corpName]);

	useEffect(() => {
		if (!showLoading) {
			drawChart();
			// updateChart();
		}
		// eslint-disable-next-line
	}, [entities, showLoading]);

	const drawChart = () => {
		if (!entities || entities.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current);
		setEchart(myChart);

		const option = {
			// animation: true,
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			toolbox: {
				bottom: 10,
				right: 10,
				feature: {
					saveAsImage: {
						show: true,
						name: 'ipgrim 워드클라우드',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			series: [
				{
					type: 'wordCloud',
					shape: 'pentagon', // circle, cardioid, diamond, triangle-forward, triangle, pentagon, star
					maskImage: false,
					left: 'center',
					top: 0, //'center',
					width: '90%',
					height: '80%',
					right: null,
					bottom: null,
					sizeRange: [12, 60],
					rotationRange: [0, 0],
					// rotationStep: 90,
					gridSize: 8,
					drawOutOfBound: false,

					// Global text style
					textStyle: {
						normal: {
							fontFamily: 'Noto Sans KR',
							fontWeight: '500',
							// Color can be a callback function or a color string
							color: function () {
								return randomColor({
									luminosity: 'bright', // bright, light, dark or random
									hue: 'blue', // red, orange, yellow, green, blue, purple, pink, monochrome or random
									format: 'rgb'
								});
							}
						},
						emphasis: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},
					data: entities
				}
			]
		};
		myChart.setOption(option);
	};

	const handleResize = debounce(() => {
		if (echart) {
			echart.resize();
		}
	}, 500);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	if (showLoading) {
		return <SpinLoading className="h-360" />;
	}
	if (!showLoading && entities.length === 0) {
		return (
			<EmptyMsg
				icon="wb_incandescent"
				msg="분석할 보유 특허가 없습니다."
				text="선택하신 기업명으로 검색된 보유특허 내역이 없습니다."
				className="max-h-320"
			/>
		);
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow-none">
			<div className="flex justify-end">
				<WordCloudMenu />
			</div>
			<div id="main" className="w-full h-360" ref={chartRef}></div>
		</Paper>
	);
}

export default WordCloudChart;
