import React, { useRef, useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import echarts from 'echarts';
import moment from 'moment';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useSelector } from 'react-redux';

function calculateMA(data, count) {
  const result = [];
  for (let i = 0; i < data.size; i++) {
    if (i < count) {
      result.push('-');
      continue;
    }
    let sum = 0;
    for (let j = 0; j < count; j++) {
      sum += data.getIn([
        i - j,
        'weightedAverage'
      ]);
    }

    // result.push((sum / count).toFixed(isBTC ? 4 : 10));
    result.push((sum / count).toFixed(4));
  }
  return result;
}

function StockChart(props) {
	const chartRef = useRef(null);
	const stock = useSelector(({companyApp}) => companyApp.search.stock);
	const [series, setSeries] = useState(null);
	const [xAxis, setXAxis] = useState(null);

	useEffect(() => {
		const drawChart = () => {
			if(!stock) return;

			const option = {
				animation: false,
				title: {
					left: 'left',
					text: '삼성전자 주식회사'
				},
				legend: {
					top: 30,
					// data: ['가치변화', 'MA5', 'MA10', 'MA20', 'MA30']
					data: ['가치변화', 'MA5', 'MA15', 'MA50']
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
					label: {
						formatter: (object) => {
						return isNaN(object.value)
							// ? moment(object.value).format('YYYY MMM DD HH:mm')
							? moment(object.value).format('YY-MM-DD')
							: object.value
						}
					},
					type: 'cross'
					},
					backgroundColor: 'rgba(245, 245, 245, 0.8)',
					borderWidth: 1,
					borderColor: '#ccc',
					padding: 10,
					textStyle: {
					color: '#000'
					},
					position: function (pos, params, el, elRect, size) {
					var obj = {
						top: 32
					};
					obj[
						['left', 'right'][+ (pos[0] < size.viewSize[0] / 2)]
					] = 100;
					return obj;
					},
					extraCssText: 'width: 170px'
				},				
				axisPointer: {
					link: {
					xAxisIndex: 'all'
					},
					label: {
					backgroundColor: '#777'
					}
				},
				dataZoom: [
					{
					type: 'inside',
					xAxisIndex: [
						0, 1
					],
					start: 60,
					end: 100
					}, {
					show: true,
					xAxisIndex: [
						0, 1
					],
					type: 'slider',
					bottom: '0%',
					height: '5%',
					start: 60,
					end: 100,
					showDetail: false
					}
				],
				xAxis: [
					{
					type: 'category',
					data: stock.dates,
					scale: true,
					boundaryGap: false,
					axisLabel: {
						formatter: (date) => moment(date).format('MM-DD')
					},
					axisLine: {
						onZero: false
					},
					splitLine: {
						show: false
					},
					splitNumber: 20,
					min: 'dataMin',
					max: 'dataMax',
					axisPointer: {
						z: 100
					}
					}, {
					type: 'category',
					gridIndex: 1,
					data: stock.dates,
					scale: true,
					boundaryGap: false,
					axisLine: {
						onZero: false
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					},
					axisLabel: {
						show: false
					},
					splitNumber: 20,
					min: 'dataMin',
					max: 'dataMax'
					}
				],
				yAxis: [
					{
					scale: true,
					splitArea: {
						show: true
					}
					}, {
					scale: true,
					gridIndex: 1,
					splitNumber: 2,
					axisLabel: {
						show: false
					},
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					}
					}
				],
				grid: [
					{
					top: '10%',
					left: '0',
					right: '0',
					height: '65%'
					}, {
					left: '0',
					right: '0',
					bottom: '5%',
					height: '15%'
					}
				],		
				series: [
					{
					type: 'candlestick',
					name: '가치변화',
					data: stock.data,
					itemStyle: {
						normal: {
						opacity: 0.5,
						color: '#0CF49B',
						color0: '#FD1050',
						borderColor: '#0CF49B',
						borderColor0: '#FD1050'
						}
					}
					}, {
					name: 'MA5',
					type: 'line',
					data: calculateMA(stock.data, 5),
					smooth: true,
					lineStyle: {
						normal: {
						width: 2
						}
					},
					areaStyle: {
						normal: {
						color: new echarts
							.graphic
							.LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: 'rgba(255, 158, 68, 0.25)'
							}, {
								offset: 1,
								color: 'rgba(255, 70, 131, 0.25)'
							}
							])
						}
					}
					}, {
					name: 'MA15',
					type: 'line',
					data: calculateMA(stock.data, 15),
					enabled: false,
					smooth: true,
					lineStyle: {
						normal: {
						width: 1,
						opacity: 0.7
						}
					}
					}, {
					name: 'MA50',
					type: 'line',
					data: calculateMA(stock.data, 50),
					smooth: true,
					lineStyle: {
						normal: {
						width: 1,
						opacity: 0.7
						}
					}
					}, {
					name: '거래량',
					type: 'bar',
					xAxisIndex: 1,
					yAxisIndex: 1,
					data: stock.volumes
					}
				]
				};

			const myChart = echarts.init(chartRef.current);
			// echart = myChart;
			setSeries(option.series);
			setXAxis(option.xAxis);

			myChart.setOption(option);
		};
		
		drawChart();
	}, [stock]);



	if ( !stock || stock.length === 0) {
	    return <SpinLoading />
	}

	return (
		<Paper className="rounded-8 shadow h-full w-full m-8 p-16 items-center justify-center">
			<div id="main" className="w-full h-xs" ref={chartRef}>
			</div>
		</Paper>
	);
}

export default StockChart;
