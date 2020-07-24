import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/royal';
// import SpinLoading from 'app/main/apps/lib/SpinLoading';

function CrossAnalysisB(props) {
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
		// if (!entities || entities.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current, 'royal');
		setEchart(myChart);

		const option = {
			grid: {
				left: '3%',
				right: '25%',
				bottom: '3%',
				containLabel: true
			},
			tooltip: {
				// trigger: 'axis',
				showDelay: 0,
				formatter: function (params) {
					if (params.value.length > 1) {
						return params.seriesName + ' :<br/>CPP ' + params.value[0] + ' PFS ' + params.value[1];
					} else {
						return params.seriesName + ' :<br/>' + params.name + ' : ' + params.value + ' ';
					}
				},
				axisPointer: {
					show: true,
					type: 'cross',
					lineStyle: {
						type: 'dashed',
						width: 1
					}
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
				data: ['KR', 'US', 'NZ', 'CA', 'FR', 'GB', 'NL', 'CH', 'JP', 'CN', 'DE', 'IL']
			},
			xAxis: [
				{
					type: 'value',
					name: 'PFS',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: false
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: 'CPP',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: false
					}
				}
			],
			series: [
				{
					name: '평균CPP',
					type: 'scatter',
					data: [[3, 1.1]],
					markArea: {
						silent: true,
						itemStyle: {
							color: 'transparent',
							borderWidth: 1,
							borderType: 'dashed'
						},
						data: [
							[
								{
									name: '평균 피인용비(CPP)',
									xAxis: 'min',
									yAxis: 'min'
								},
								{
									xAxis: 'max',
									yAxis: 'max'
								}
							]
						]
					},
					// markPoint: {
					// 	data: [
					// 		{ type: 'max', name: '最大值' },
					// 		{ type: 'min', name: '最小值' }
					// 	]
					// },
					markLine: {
						lineStyle: {
							type: 'solid'
						},
						data: [{ type: 'average', name: 'CPP' }, { xAxis: 160 }]
					}
				},
				{
					name: '평균 Family size',
					type: 'scatter',
					data: [[6.1, 5]],
					markArea: {
						silent: true,
						itemStyle: {
							color: 'transparent',
							borderWidth: 1,
							borderType: 'dashed'
						},
						data: [
							[
								{
									xAxis: 'min',
									yAxis: 'min'
								},
								{
									name: '평균 Family size',
									xAxis: 'min',
									yAxis: 'max'
								}
							]
						]
					},
					markPoint: {
						data: [
							{ type: 'max', name: 'PFS' },
							{ type: 'min', name: 'CPP' }
						]
					},
					markLine: {
						lineStyle: {
							type: 'dashed'
						},
						data: [{ type: 'average', name: 'PFS' }, { xAxis: 'average' }]
					}
				},
				{
					name: 'KR',
					type: 'scatter',
					data: [[3, 2]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'US',
					type: 'scatter',
					data: [[5, 2]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'NZ',
					type: 'scatter',
					data: [[3.5, 2.3]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'JP',
					type: 'scatter',
					data: [[4.2, 0.9]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'IL',
					type: 'scatter',
					data: [[5.8, 1.2]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'CH',
					type: 'scatter',
					data: [[6.1, 0.4]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'CN',
					type: 'scatter',
					data: [[6, 0]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'CA',
					type: 'scatter',
					data: [[6.2, 4]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'FR',
					type: 'scatter',
					data: [[7, 2.6]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'GB',
					type: 'scatter',
					data: [[10, 1.8]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'DE',
					type: 'scatter',
					data: [[9.5, 0.2]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
				},
				{
					name: 'NL',
					type: 'scatter',
					data: [[14.5, 2.4]],
					label: {
						normal: {
							show: true,
							position: 'top',
							distance: 4,
							formatter: '{a}'
						}
					}
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

	// if (!entities || entities.length === 0) {
	// 	return <SpinLoading />;
	// }

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
