import React, { useState, useEffect, useRef } from 'react';
import Paper from '@material-ui/core/Paper';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/blue';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/core';

// function calculateCnt(arr) {
// 	let result = { name: [], value: [] };
// 	arr.forEach(item => {
// 		result['name'].push(item['name']);
// 		result['value'].push(Number(item['value']).toLocaleString());
// 	});
// 	// console.log('calculateCnt -> result', result);
// 	// const filterA = 'ipc요약';
// 	// const result = _.chain(arr)
// 	// 	.filter(item => !!item[filterA])
// 	// 	.groupBy(filterA)
// 	// 	.map((value, key) => ({ name: key, value: value.length }))
// 	// 	.orderBy(['value'], ['desc'])
// 	// 	.splice(0, 15)
// 	// 	.defaultsDeep({ name: [], value: [] })
// 	// 	.value();
// 	return result;
// }

function ApplicantPie(props) {
	const { entities } = props;
	const [data, setData] = useState(entities);

	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	useEffect(() => {
		if (entities && entities.length > 0) {
			// setData(calculateCnt(entities));
			setData(entities);
		}
		// eslint-disable-next-line
	}, [entities]);

	useEffect(() => {
		drawChart();
		// eslint-disable-next-line
	}, [data]);

	const drawChart = () => {
		if (!data || data.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current, 'blue');
		setEchart(myChart);

		const option = {
			color: [
				theme.palette.primary.dark,
				theme.palette.primary.main,
				theme.palette.primary.light,
				theme.palette.secondary.dark,
				theme.palette.secondary.main,
				theme.palette.secondary.light
			],
			tooltip: {
				trigger: 'item',
				formatter: '{a} <br/>{b} : {c} ({d}%)'
			},
			legend: {
				orient: 'vertical',
				left: 'right',
				top: 50,
				// data: data.map(a => a.name)
				data: data.name
			},
			series: [
				{
					name: 'IPC코드',
					type: 'pie',
					radius: '55%',
					center: ['45%', '50%'],
					data: data,
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			],
			toolbox: {
				feature: {
					dataView: {
						show: true,
						title: '표로 보기',
						lang: ['표로 보기', '닫기', '갱신'],
						readOnly: false
					},
					saveAsImage: {
						show: true,
						name: 'ipgrim IPC별 차트',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			}
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

	return (
		<Paper className="w-full h-full rounded-8 shadow mb-16">
			<div className="flex flex-col w-full h-full items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					출원인 보유기술 비중
				</h6>
				{!entities || entities.length === 0 ? (
					<SpinLoading className="w-full h-400" delay={15000} />
				) : (
					<div id="main" className="w-full h-360" ref={chartRef} />
				)}
			</div>
		</Paper>
	);
}

export default ApplicantPie;
