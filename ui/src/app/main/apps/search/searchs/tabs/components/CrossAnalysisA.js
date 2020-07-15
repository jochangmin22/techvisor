import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/blue';

// const entities = [
// 	{ 출원인: '삼성전자', 피인용수: '22', CPP: '4.4', 전체: '4', PII: '1.1', TS: '5.50', PFS: '0.75' },
// 	{ 출원인: '엘지전자', 피인용수: '30', CPP: '3', 전체: '4', PII: '0.75', TS: '7.50', PFS: '0.50' },
// 	{ 출원인: '구글 엘엘씨', 피인용수: '27', CPP: '9', 전체: '4', PII: '2.25', TS: '6.75', PFS: '3.13' },
// 	{ 출원인: '에스케이플래닛 주식회사', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.94' },
// 	{ 출원인: '한국전자통신연구원', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' },
// 	{ 출원인: '마이크로소프트 코포레이션', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' }
// ];

function CrossAnalysis(props) {
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ searchApp }) => searchApp.searchs.indicator);

	// const data = useMemo(() => entities, []);

	useEffect(() => {
		if (entities) {
			drawChart();
		}
		// eslint-disable-next-line
	}, [entities]);

	const drawChart = () => {
		// if (!entities.data) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current, 'blue');
		setEchart(myChart);

		const option = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: '#999'
					}
				}
			},
			toolbox: {
				feature: {
					dataView: { show: true, readOnly: false },
					magicType: { show: true, type: ['line', 'bar'] },
					restore: { show: true },
					saveAsImage: { show: true }
				}
			},
			legend: {
				data: ['특허등록수', 'CPP', 'PII', 'TS', 'PFS']
			},
			xAxis: [
				{
					type: 'category',
					data: ['KIPO', 'USPTO', 'JPO', 'EPO'],
					axisPointer: {
						type: 'shadow'
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '수치',
					min: 0,
					max: 90,
					interval: 10,
					axisLabel: {
						formatter: '{value}'
					}
				}
				// {
				// 	type: 'value',
				// 	name: '温度',
				// 	min: 0,
				// 	max: 25,
				// 	interval: 5,
				// 	axisLabel: {
				// 		formatter: '{value} °C'
				// 	}
				// }
			],
			series: [
				{
					name: '특허등록수',
					type: 'bar',
					data: [41, 25, 24, 11]
				},
				{
					name: '출원인수',
					type: 'bar',
					data: [42, 28, 26, 15]
				},
				{
					name: 'CPP',
					type: 'bar',
					// yAxisIndex: 1,
					data: [9.31, 0.56, 2.54, 0.82]
				},
				{
					name: 'PII',
					type: 'bar',
					data: [2.02, 0.12, 0.55, 0.18]
				},
				{
					name: 'TS',
					type: 'bar',
					data: [82.79, 3.03, 13.22, 1.95]
				},
				{
					name: 'PFS',
					type: 'bar',
					data: [0.24, 0.24, 0.34, 0.16]
				}
			]
		};

		// setSeries(option.series);
		// setXAxis(option.xAxis);

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

	// if (!searchs || searchs.length === 0) {
	// 	return <SpinLoading />;
	// }

	// if (!data || data.length === 0) {
	// 	return <SpinLoading />;
	// }

	return (
		<Paper className="w-full h-full shadow-none">
			<div className="flex justify-center border-b-1">
				<Typography variant="body1" className="my-8">
					CPP, PII, TS 및 PFS 교차분석
				</Typography>
				{/* <PopoverMsg title="CPP, PII, TS 및 PFS 교차분석" variant="body1" msg="" /> */}
			</div>
			<div id="main" className="w-full h-xs" ref={chartRef} />
		</Paper>
	);
}

export default React.memo(CrossAnalysis);
