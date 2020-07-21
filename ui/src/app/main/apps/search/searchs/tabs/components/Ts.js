import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import debounce from 'lodash/debounce';
import _ from '@lodash';
import echarts from 'echarts';
import 'echarts/theme/shine';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';

const entities = [
	{ 출원인: '삼성전자', 피인용수: '22', CPP: '4.4', 전체: '4', PII: '1.1', TS: '5.50', PFS: '0.75' },
	{ 출원인: '엘지전자', 피인용수: '30', CPP: '3', 전체: '4', PII: '0.75', TS: '7.50', PFS: '0.50' },
	{ 출원인: '구글 엘엘씨', 피인용수: '27', CPP: '9', 전체: '4', PII: '2.25', TS: '6.75', PFS: '3.13' },
	{ 출원인: '에스케이플래닛 주식회사', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.94' },
	{ 출원인: '한국전자통신연구원', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' },
	{ 출원인: '마이크로소프트 코포레이션', 피인용수: '1', CPP: '0.5', 전체: '4', PII: '0.13', TS: '0.26', PFS: '0.6' }
];

function Ts(props) {
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ searchApp }) => searchApp.searchs.indicator);

	const data = useMemo(() => entities, []);

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
		// echarts.registerTheme('macarons', theme);
		const myChart = echarts.init(chartRef.current, 'shine');
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
				data: ['蒸发量', '降水量', '平均温度']
			},
			xAxis: [
				{
					type: 'category',
					data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
					axisPointer: {
						type: 'shadow'
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '水量',
					min: 0,
					max: 250,
					interval: 50,
					axisLabel: {
						formatter: '{value} ml'
					}
				},
				{
					type: 'value',
					name: '温度',
					min: 0,
					max: 25,
					interval: 5,
					axisLabel: {
						formatter: '{value} °C'
					}
				}
			],
			series: [
				{
					name: '蒸发量',
					type: 'bar',
					data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
				},
				{
					name: '降水量',
					type: 'bar',
					data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
				},
				{
					name: '平均温度',
					type: 'line',
					yAxisIndex: 1,
					data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
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
				<PopoverMsg
					title="기술력지수(TS: Technology Strength)"
					variant="body1"
					msg="기술력지수가 클수록 해당 국가(또는 연구주체)의 기술력이 높음을 의미함"
				/>
			</div>
			<div id="main" className="w-full h-xs" ref={chartRef} />
		</Paper>
	);
}

export default React.memo(Ts);
