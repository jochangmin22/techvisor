import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/blue';
import _ from '@lodash';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/core';

const initialState = {
	PU: {
		count: 54,
		data: [822],
		labels: ['2012']
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
	let p = { day: '출원일자', ip: null };
	if (val === 'PP') {
		p = { day: '공개일자', ip: '1' };
	} else if (val === 'UP') {
		p = { day: '공개일자', ip: '2' };
	} else if (val === 'PR') {
		p = { day: '등록일자', ip: '1' };
	} else if (val === 'UR') {
		p = { day: '등록일자', ip: '2' };
	}

	const result = _.chain(arr)
		.filter(item => !!item[p.day])
		.filter(item => (p.ip ? String(item.출원번호).startsWith(p.ip) : item))
		.groupBy(o => o[p.day].slice(0, 4))
		.map((value, key) => ({ labels: key, data: value.length }))
		.reduce((re, { labels, data }) => {
			if (!re['labels']) re['labels'] = [];
			if (!re['data']) re['data'] = [];
			if (!re['count']) re['count'] = 0;
			re['labels'].push(labels);
			re['data'].push(data);
			re['count'] += data;
			return re;
		}, {})
		.defaultsDeep({ count: 0, labels: [], data: [] })
		.value();
	return result;
}

function ApplicationNumber(props) {
	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ abroadApp }) => abroadApp.searchs.entities);

	const [data, setData] = useState(initialState);

	useEffect(() => {
		function updateState(arr) {
			['PU', 'PP', 'PR', 'UP', 'UR'].map(key => {
				data[key] = calculateCnt(key, arr);
				return setData(data);
			});
		}

		if (entities && entities.length > 0) {
			updateState(entities);
			drawChart();
		}
		// eslint-disable-next-line
	}, [props.searchText, entities]);

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
					data: data.PU.labels,
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
					data: data.PU.data
				},
				{
					name: '특허출원',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.PP.data
				},
				{
					name: '실용출원',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.UP.data
				},
				{
					name: '특허등록',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.PR.data
				},
				{
					name: '실용등록',
					type: 'bar',
					xAxisIndex: 0,
					yAxisIndex: 1,
					data: data.UR.data
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
		<Paper className="w-full h-full shadow-none">
			<div className="flex justify-center border-b-1">
				<Typography variant="body1" className="my-8">
					연도별 출원·등록건수
				</Typography>
			</div>
			<div id="main" className="w-full h-360" ref={chartRef} />
		</Paper>
	);
}

export default ApplicationNumber;
