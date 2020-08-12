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
import PopoverContent from 'app/main/apps/lib/PopoverContent';
// import SpinLoading from 'app/main/apps/lib/SpinLoading';

const content = (
	<>
		<Typography variant="body1" className="mb-8">
			피인용도지수(Cites Per Patent, CPP)
		</Typography>
		<Typography variant="caption" className="text-gray-600">
			피인용이 높을 수록 영향력이 크며, 특허수 대비 인용수를 기준으로 계산됩니다.
		</Typography>
		<Typography variant="body1" className="my-8">
			영향력지수(Patent Impact Index, PII)
		</Typography>
		<Typography variant="caption" className="text-gray-600">
			PII가 높을 수록 소유한 기술의 질적 수준이 높으며, CPP를 전체 등록특허의 피인용도로 나눈 값으로 계산됩니다.
		</Typography>
		<Typography variant="body1" className="my-8">
			기술력지수(Technology Strength, TS)
		</Typography>
		<Typography variant="caption" className="text-gray-600">
			TS가 높을 수록 기술적 역량이 크며, CPP에 특허건수를 곱한 값으로 계산됩니다.
		</Typography>
		<Typography variant="body1" className="my-8">
			시장확보지수(Patent Family Size, PFS)
		</Typography>
		<Typography variant="caption" className="text-gray-600">
			패밀리 보유 건이 많은 척도로 많을 수록 시장력이 강합니다. 특허수 대비 패밀리수를 기준으로 계산됩니다.
		</Typography>
	</>
);

function calculateCnt(arr) {
	const result = _.chain(arr)
		.orderBy(['cnt', 'cpp', 'pfs', 'pii', 'ts'], ['desc', 'desc', 'desc', 'desc', 'desc'])
		.slice(0, 20)
		.defaultsDeep({ name: [], cnt: [], cpp: [], pfs: [], pii: [], ts: [] })
		.value();
	return result;
}

function CrossAnalysisA(props) {
	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ searchApp }) => searchApp.searchs.indicator);

	const [data, setData] = useState([]);

	useEffect(() => {
		if (entities && entities.length > 0) {
			setData(calculateCnt(entities));
		}
		// eslint-disable-next-line
	}, [props.searchText, entities]);

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
						name: 'ipgrim 교차분석 차트1',
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
				data: ['CPP', 'PII', 'TS', 'PFS']
				// data: data.map(a => a.name)
			},
			grid: [
				{
					bottom: 110
				}
			],
			dataZoom: [
				{
					type: 'inside',
					start: 0,
					end: 40,
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
			xAxis: [
				{
					type: 'category',
					data: data.map(a => a.name),
					axisPointer: {
						type: 'shadow'
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '수치',
					// min: 0,
					// max: 90,
					// interval: 10,
					axisLabel: {
						formatter: '{value}'
					}
				},
				{
					type: 'value',
					name: '수치',
					// min: 0,
					// max: 90,
					// interval: 10,
					axisLabel: {
						formatter: '{value}'
					}
				}
			],
			series: [
				{
					name: '피인용수',
					type: 'bar',
					data: data.map(a => a.citing)
				},
				{
					name: '총등록수',
					type: 'bar',
					data: data.map(a => a.cnt)
				},
				{
					name: 'CPP',
					type: 'bar',
					yAxisIndex: 1,
					data: data.map(a => a.cpp)
				},
				{
					name: 'PII',
					type: 'bar',
					yAxisIndex: 1,
					data: data.map(a => a.pii)
				},
				{
					name: 'TS',
					type: 'bar',
					yAxisIndex: 1,
					data: data.map(a => a.ts)
				},
				{
					name: 'PFS',
					type: 'bar',
					yAxisIndex: 1,
					data: data.map(a => a.pfs)
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
				<PopoverContent content={content} title="CPP, PII, TS 및 PFS 교차분석" variant="body1" />
			</div>
			<div id="main" className="w-full h-xs" ref={chartRef} />
		</Paper>
	);
}

export default CrossAnalysisA;
