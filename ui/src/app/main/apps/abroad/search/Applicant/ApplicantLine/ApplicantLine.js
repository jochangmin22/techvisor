import React, { useState, useEffect, useRef } from 'react';
import Paper from '@material-ui/core/Paper';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/core';

const initialState = {
	PU: {
		count: 54,
		data: [822, 112],
		labels: ['2012', '2013']
	},
	PP: {
		count: 54,
		data: [3],
		labels: ['2012']
	},
	PR: {
		count: 27,
		data: [3],
		labels: ['2012']
	},
	UP: {
		count: 4,
		data: [3],
		labels: ['2012']
	},
	UR: {
		count: 6,
		data: [3],
		labels: ['2012']
	}
};

function calculateCnt(val, arr) {
	let p = { A: 'pyr', B: 'pp' };
	if (val === 'pp' || val === 'up') {
		p = { A: 'pyr', B: val };
	} else if (val === 'pr' || val === 'ur') {
		p = { A: 'ryr', B: val };
	}

	let result = { count: 0, labels: [], data: [] };
	arr.filter(item => !!item[p.A])
		.filter(item => !!item[p.B])
		.forEach(item => {
			result['labels'].push(item[p.A]);
			result['data'].push(item[p.B]);
			result['count'] += item[p.B];
		});
	//{pyr: null, ryr: "1995", pp: null, up: null, pr: 1167, ur: null}

	// const result = _.chain(arr)
	// 	.filter(item => !!item[p.A])
	// 	.filter(item => !!item[p.B])
	// 	// .filter(item => (p.B ? String(item.출원번호).startsWith(p.B) : item))
	// 	// .filter(item => (p.B ? item.구분 === p.B : item))
	// 	// .groupBy(o => o[p.A].slice(0, 4))
	// 	.groupBy(o => o[p.A])
	// 	.map((value, key) => ({ labels: key, data: value.length }))
	// 	.reduce((re, { labels, data }) => {
	// 		if (!re['labels']) re['labels'] = [];
	// 		if (!re['data']) re['data'] = [];
	// 		if (!re['count']) re['count'] = 0;
	// 		re['labels'].push(labels);
	// 		re['data'].push(data);
	// 		re['count'] += data;
	// 		return re;
	// 	}, {})
	// 	.defaultsDeep({ count: 0, labels: [], data: [] })
	// 	.value();
	// console.log('calculateCnt -> result', result);
	return result;
}

function ApplicantLine(props) {
	const { entities } = props;
	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);
	const [data, setData] = useState(initialState);

	useEffect(() => {
		function updateState(arr) {
			['pu', 'pp', 'pr', 'up', 'ur'].map(key => {
				data[key] = calculateCnt(key, arr);
				return setData(data);
			});
		}

		if (entities && entities.length > 0) {
			updateState(entities);
			drawChart();
		}
		// eslint-disable-next-line
	}, [entities]);

	const drawChart = () => {
		if (!data || data.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current);
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
					dataView: {
						show: true,
						title: '표로 보기',
						lang: ['표로 보기', '닫기', '갱신'],
						readOnly: false
					},
					magicType: {
						show: true,
						title: { line: '선', bar: '바', stack: '누적 막대', tiled: '타일' },
						type: ['line', 'bar', 'stack', 'tiled']
					},
					restore: { show: true, title: '원래대로' },
					saveAsImage: {
						show: true,
						name: 'ipgrim 출원건수 차트',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			legend: {
				right: 'center',
				bottom: 0,
				orient: 'horizontal',
				width: '100%',
				data: ['출원건수', '특허출원', '실용출원', '특허등록', '실용등록']
			},
			xAxis: [
				{
					type: 'category',
					data: data.pu.labels,
					axisPointer: {
						type: 'shadow'
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '건수',
					// min: 0,
					// max: 90,
					// interval: 10,
					axisLabel: {
						formatter: '{value}'
					}
				},
				{
					type: 'value',
					name: '건수',
					// min: 0,
					// max: 10,
					// interval: 1,
					axisLabel: {
						formatter: '{value}'
					}
				}
			],
			grid: [
				{
					bottom: 110
				}
			],
			dataZoom: [
				{
					type: 'inside',
					start: 60,
					end: 100,
					bottom: 60,
					height: 20
				},
				{
					start: 0,
					end: 10,
					bottom: 60,
					height: 20,
					handleIcon:
						'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
					handleSize: '80%',
					handleStyle: {
						color: '#fff',
						shadowBlur: 3,
						shadowColor: 'rgba(0, 0, 0, 0.6)',
						shadowOffsetX: 2,
						shadowOffsetY: 2
					}
				}
			],
			series: [
				{
					name: '출원건수',
					type: 'line',
					xAxisIndex: 0,
					data: data.pu.data
				},
				{
					name: '특허출원',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.pp.data
				},
				{
					name: '실용출원',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.up.data
				},
				{
					name: '특허등록',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.pr.data
				},
				{
					name: '실용등록',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.ur.data
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

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex flex-col items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					출원인 출원 동향
				</h6>
				<div id="main" className="w-full h-360" ref={chartRef} />
			</div>
		</Paper>
	);
}

export default ApplicantLine;
