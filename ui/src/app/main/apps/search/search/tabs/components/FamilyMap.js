import React, { useRef, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import echarts from 'echarts';

function FamilyMap(props) {
	const chartRef = useRef(null);
	// let echart = null;
	useEffect(() => {
		drawChart();
		// eslint-disable-next-line
	}, []);

	const drawChart = () => {
		const myChart = echarts.init(chartRef.current);
		// echart = myChart;

		const option = {
			title: {
				// text: 'Graph 简单示例'
			},
			tooltip: {},
			animationDurationUpdate: 1500,
			animationEasingUpdate: 'quinticInOut',
			series: [
				{
					type: 'graph',
					zoom: 1,
					layout: 'none',
					symbolSize: [150, 50],
					symbolOffset: [0, 0],
					color: 'rgba(60, 178, 239, 1)',
					roam: true,
					// nodeScaleRatio: 0.6,
					symbol: 'rect',
					label: {
						show: true,
						color: '#000'
					},
					cursor: 'default',
					itemStyle: {
						color: 'rgba(255, 255, 255, 1)',
						borderWidth: 2,
						borderType: 'solid'
						// shadowBlur: 10,
						// shadowColor: 'rgba(0, 0, 0, 0.3)'
					},
					edgeSymbol: ['none', 'none'],
					edgeSymbolSize: [4, 10],
					edgeLabel: {
						fontSize: 20
					},
					data: [
						{
							name: `${props.appNo}`,
							x: 0,
							y: 0,
							itemStyle: {
								borderColor: 'rgba(60, 178, 239, 1)'
							}
						},
						{
							name: 'KR1020110137078 A',
							x: 10,
							y: 0,
							itemStyle: {
								borderColor: 'rgba(0, 176, 80, 1)'
							}
						},
						{
							name: 'KR1019909880000 A',
							x: 10,
							y: -1,
							itemStyle: {
								borderColor: 'rgba(0, 176, 80, 1)'
							}
						},
						{
							name: 'KR1020070105013 A',
							x: -10,
							y: 0,
							itemStyle: {
								borderColor: 'rgba(244, 80, 0, 1)'
							}
						},
						{
							name: 'KR1020050031225 A',
							x: -10,
							y: -1,
							itemStyle: {
								borderColor: 'rgba(244, 80, 0, 1)'
							}
						},
						{
							name: 'KR1020040003587 A',
							x: -10,
							y: 1,
							itemStyle: {
								borderColor: 'rgba(244, 80, 0, 1)'
							}
						}
					],
					// links: [],
					links: [
						// {
						// 	source: 0,
						// 	target: 1,
						// 	symbolSize: [5, 20],
						// 	label: {
						// 		show: true
						// 	},
						// 	lineStyle: {
						// 		width: 5,
						// 		curveness: 0.2
						// 	}
						// },
						// {
						// 	source: '节点2',
						// 	target: `${props.appNo}`,
						// 	label: {
						// 		show: true
						// 	},
						// 	lineStyle: {
						// 		curveness: 0.2
						// 	}
						// },
						{
							source: `${props.appNo}`,
							target: 'KR1020110137078 A',
							lineStyle: {
								color: 'rgba(0, 176, 80, 1)'
							}
						},
						{
							source: `${props.appNo}`,
							target: 'KR1019909880000 A',
							lineStyle: {
								color: 'rgba(0, 176, 80, 1)'
							}
						},
						{
							source: `${props.appNo}`,
							target: 'KR1020070105013 A',
							lineStyle: {
								color: 'rgba(244, 80, 0, 1)'
							}
						},
						{
							source: `${props.appNo}`,
							target: 'KR1020050031225 A',
							lineStyle: {
								color: 'rgba(244, 80, 0, 1)'
							}
						},
						{
							source: `${props.appNo}`,
							target: 'KR1020040003587 A',
							lineStyle: {
								color: 'rgba(244, 80, 0, 1)'
							}
						}
					],
					lineStyle: {
						opacity: 1,
						width: 2,
						curveness: 0
					}
				}
			]
		};

		myChart.setOption(option);
	};

	return (
		<Paper className="w-full h-288 rounded-8 shadow mb-16">
			<Typography className="p-16 pl-28 text-14 font-bold">패밀리 맵</Typography>
			<div id="main" className="w-full h-full" ref={chartRef}></div>
		</Paper>
	);
}

export default FamilyMap;
