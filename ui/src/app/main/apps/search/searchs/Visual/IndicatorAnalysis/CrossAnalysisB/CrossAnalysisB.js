import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/royal';
import _ from '@lodash';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useTheme } from '@material-ui/core';

function calculateCnt(arr) {
	const l = _.chain(arr)
		.orderBy(['cnt', 'cpp', 'pfs', 'pii', 'ts'], ['desc', 'desc', 'desc', 'desc', 'desc'])
		.slice(0, 10)
		.defaultsDeep({ name: [], cnt: [], cpp: [], pfs: [], pii: [], ts: [] })
		.value();

	// const name = l.map(({ name }) => [name]);
	const res = l.map(({ cpp, pfs, cnt, name }) => [parseFloat(cpp), parseFloat(pfs), cnt, name, name]);
	return res;
}

function CrossAnalysisB(props) {
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
		// if (!entities || entities.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current, 'blue');
		setEchart(myChart);

		let option = {
			color: [
				theme.palette.primary.dark,
				theme.palette.primary.main,
				theme.palette.primary.light,
				theme.palette.secondary.dark,
				theme.palette.secondary.main,
				theme.palette.secondary.light
			],
			grid: {
				left: '3%',
				right: '35%',
				bottom: '3%',
				containLabel: true
			},
			tooltip: {
				padding: 10,
				backgroundColor: 'rgba(50,50,50,0.7)',
				borderColor: '#777',
				borderWidth: 1,
				formatter: function (obj) {
					var value = obj.value;
					return (
						'<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 12px;padding-bottom: 7px;margin-bottom: 7px">' +
						value[3] +
						' (' +
						value[2] +
						')' +
						'</div>' +
						' CPP : ' +
						value[0] +
						'<br>' +
						' PFS : ' +
						value[1] +
						'<br>'
					);
				}
			},
			toolbox: {
				feature: {
					dataZoom: { show: true, title: { zoom: '영역 줌', back: '줌 복원' } },
					brush: {
						type: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
						title: {
							rect: '사각형 그리기',
							polygon: '폴리곤 그리기',
							lineX: '라인X 그리기',
							lineY: '라인Y 그리기',
							keep: '유지',
							clear: '초기화'
						}
					},
					saveAsImage: {
						show: true,
						name: 'ipgrim 교차분석 차트2',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			brush: {},
			legend: {
				right: 10,
				top: '15%',
				orient: 'vertical',
				data: data.map(a => a[3])
			},
			xAxis: {
				type: 'value',
				name: 'CPP',
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				}
				// splitNumber: 20
			},
			yAxis: {
				type: 'value',
				name: 'PFS',
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				}
			},
			series: [
				// {
				// 	name: '평균CPP',
				// 	type: 'scatter',
				// 	data: [[3, 1.1]],
				// 	markArea: {
				// 		silent: true,
				// 		itemStyle: {
				// 			color: 'transparent',
				// 			borderWidth: 1,
				// 			borderType: 'dashed'
				// 		},
				// 		data: [
				// 			[
				// 				{
				// 					name: '평균 피인용비(CPP)',
				// 					xAxis: 'min',
				// 					yAxis: 'min'
				// 				},
				// 				{
				// 					xAxis: 'max',
				// 					yAxis: 'max'
				// 				}
				// 			]
				// 		]
				// 	},
				// 	// markPoint: {
				// 	// 	data: [
				// 	// 		{ type: 'max', name: '最大值' },
				// 	// 		{ type: 'min', name: '最小值' }
				// 	// 	]
				// 	// },
				// 	markLine: {
				// 		lineStyle: {
				// 			type: 'solid'
				// 		},
				// 		data: [{ type: 'average', name: 'CPP' }, { xAxis: 160 }]
				// 	}
				// },
				// {
				// 	name: '평균 Family size',
				// 	type: 'scatter',
				// 	data: [[6.1, 5]],
				// 	markArea: {
				// 		silent: true,
				// 		itemStyle: {
				// 			color: 'transparent',
				// 			borderWidth: 1,
				// 			borderType: 'dashed'
				// 		},
				// 		data: [
				// 			[
				// 				{
				// 					xAxis: 'min',
				// 					yAxis: 'min'
				// 				},
				// 				{
				// 					name: '평균 Family size',
				// 					xAxis: 'min',
				// 					yAxis: 'max'
				// 				}
				// 			]
				// 		]
				// 	},
				// 	markPoint: {
				// 		data: [
				// 			{ type: 'max', name: 'PFS' },
				// 			{ type: 'min', name: 'CPP' }
				// 		]
				// 	},
				// 	markLine: {
				// 		lineStyle: {
				// 			type: 'dashed'
				// 		},
				// 		data: [{ type: 'average', name: 'PFS' }, { xAxis: 'average' }]
				// 	}
				// },
			]
		};
		echarts.util.each(data, function (val, idx) {
			option.series.push({
				name: val[3],
				data: [val],
				type: 'scatter',
				symbolSize: Math.sqrt(val[2]) * 10,
				emphasis: {
					label: {
						show: true,
						formatter: function (param) {
							return param.data[3];
						},
						position: 'top'
					}
				},
				itemStyle: {
					shadowBlur: 10,
					opacity: 0.7,
					// shadowColor: 'rgba(120, 36, 50, 0.5)',
					shadowOffsetX: 2,
					shadowOffsetY: 2
					// color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
					// 	{
					// 		offset: 0,
					// 		color: 'rgb(251, 118, 123)'
					// 	},
					// 	{
					// 		offset: 1,
					// 		color: 'rgb(204, 46, 72)'
					// 	}
					// ])
				}
			});
		});

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
					피인용도지수(CPP)-시장확보지수(PFS) 교차분석
				</Typography>
			</div>
			<div id="main" className="w-full h-xs" ref={chartRef} />
		</Paper>
	);
}

export default CrossAnalysisB;
