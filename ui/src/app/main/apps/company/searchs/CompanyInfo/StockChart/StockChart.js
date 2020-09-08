import React, { useRef, useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import echarts from 'echarts';
import moment from 'moment';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useSelector, useDispatch } from 'react-redux';
import { setChartType } from 'app/main/apps/company/store/searchSlice';
import debounce from 'lodash/debounce';
import clsx from 'clsx';
import { chartTypes } from 'app/main/apps/lib/variables';
import FuseAnimate from '@fuse/core/FuseAnimate';

function calculateMA(dayCount, data) {
	var result = [];
	for (var i = 0, len = data.length; i < len; i++) {
		if (i < dayCount) {
			result.push('-');
			continue;
		}
		var sum = 0;
		for (var j = 0; j < dayCount; j++) {
			sum += data[i - j][1];
		}
		result.push((sum / dayCount).toFixed(0));
	}
	return result;
}

// const defaultChipData = { stock_name: '삼성전자', corpCode: '126380', stock_code: '005930' };

function StockChart(props) {
	const dispatch = useDispatch();
	const chartRef = useRef(null);
	const { stock_name, stock_code } = props;
	// const { stock_name, corpCode, stock_code } = defaultChipData;
	const entities = useSelector(({ companyApp }) => companyApp.searchs.stock.entities);
	const [today, setToday] = useState(null);
	// const [series, setSeries] = useState(null);
	// const [xAxis, setXAxis] = useState(null);
	const [echart, setEchart] = useState(null);
	// const digits = 2;

	const [currentRange, setCurrentRange] = useState({
		name: 'day',
		text: '하루',
		unit: '5분'
	});

	function handleChangeRange(range) {
		setCurrentRange(range);
		dispatch(setChartType(range));
	}

	useEffect(() => {
		if (stock_code && entities) {
			todayStock();
			drawChart();
			// updateChart();
		}
		// eslint-disable-next-line
	}, [stock_code, entities]);

	const todayStock = () => {
		if (entities && entities.data) {
			const _len = entities.data.length;
			const price = entities.data[_len - 1][1];
			const increase = price - entities.data[_len - 2][1];
			const percent = ((increase / price) * 100).toFixed(2) + '%';
			const color = increase > 0 ? 'text-red' : increase < 0 ? 'text-blue' : 'text-black';
			const icon = increase > 0 ? 'trending_up' : increase < 0 ? 'trending_down' : 'trending_flat';
			setToday({
				price: price.toLocaleString(),
				increase: Number(increase).toLocaleString(),
				color: color,
				icon: icon,
				percent: percent
			});
		}
		return;
	};

	// const updateChart = () => {
	// 	if (!echart || !series) {
	// 		return;
	// 	}

	// 	// const { data, currencyKey } = this.props;

	// 	if (!entities.data) return;
	// 	console.log('updating..');

	// 	const { series, xAxis } = this;

	// 	const dates = entities.data.map(info => new Date(info.get('date') * 1000)).toJS();
	// 	dates.push(new Date(dates[dates.length - 1].getTime() + dates[1].getTime() - dates[0].getTime()));

	// 	const candleStickData = entities.data
	// 		.map(info => {
	// 			return [
	// 				info.get('open').toFixed(digits),
	// 				info.get('close').toFixed(digits),
	// 				info.get('low').toFixed(digits),
	// 				info.get('high').toFixed(digits)
	// 			];
	// 		})
	// 		.toJS();

	// 	const volumes = entities.data.map(info => info.get('volume').toFixed(2)).toJS();

	// 	xAxis[0].data = dates;
	// 	xAxis[1].data = dates;
	// 	series[0].data = candleStickData;
	// 	series[1].data = calculateMA(entities.data, 5);
	// 	series[2].data = calculateMA(entities.data, 15);
	// 	series[3].data = calculateMA(entities.data, 50);
	// 	series[4].data = volumes;

	// 	echart.setOption({
	// 		series,
	// 		xAxis
	// 	});
	// };

	const drawChart = () => {
		if (!entities.data) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const dataMA5 = calculateMA(5, entities.data);
		const dataMA15 = calculateMA(15, entities.data);
		const dataMA50 = calculateMA(50, entities.data);

		const myChart = echarts.init(chartRef.current);
		setEchart(myChart);

		const option = {
			animation: false,
			title: {
				left: 'left',
				text: stock_name
			},
			legend: {
				top: 30,
				data: ['가치변화', 'MA5', 'MA15', 'MA50', '출원건수']
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					label: {
						formatter: object => {
							return isNaN(object.value) ? moment(object.value).format('YY-MM-DD') : object.value;
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
					obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 100;
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
					xAxisIndex: [0, 1],
					start: 60,
					end: 100
				},
				{
					show: true,
					xAxisIndex: [0, 1],
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
					data: entities.dates,
					scale: true,
					boundaryGap: false,
					axisLabel: {
						formatter: date => moment(date).format('MM-DD')
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
				},
				{
					type: 'category',
					gridIndex: 1,
					data: entities.dates,
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
				},
				{
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
				},
				{
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
					data: entities.data,
					itemStyle: {
						normal: {
							opacity: 1.0,
							color: '#3E67F1',
							color0: '#D01454',
							borderColor: '#3E67F1',
							borderColor0: '#D01454'
						}
					}
				},
				{
					name: 'MA5',
					type: 'line',
					data: dataMA5,
					smooth: true,
					lineStyle: {
						normal: {
							width: 2
						}
					},
					areaStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{
									offset: 0,
									color: 'rgba(133, 245, 245, 0.25)'
								},
								{
									offset: 1,
									color: 'rgba(71, 176, 252, 0.25)'
								}
							])
						}
					}
				},
				{
					name: 'MA15',
					type: 'line',
					data: dataMA15,
					enabled: false,
					smooth: true,
					lineStyle: {
						normal: {
							width: 1,
							opacity: 0.7
						}
					}
				},
				{
					name: 'MA50',
					type: 'line',
					data: dataMA50,
					smooth: true,
					lineStyle: {
						normal: {
							width: 1,
							opacity: 0.7
						}
					}
				},
				{
					name: '출원건수',
					type: 'line',
					data: dataMA50,
					smooth: true,
					lineStyle: {
						normal: {
							width: 1,
							opacity: 0.7
						}
					}
				},
				{
					name: '거래량',
					type: 'bar',
					xAxisIndex: 1,
					yAxisIndex: 1,
					data: entities.volumes
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
		// drawChart();
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	if (stock_name === undefined) {
		return '';
	}

	if (!stock_code || stock_code.length === 0) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center p-16">
				<div className="max-w-512 text-center">
					<FuseAnimate delay={500}>
						<Typography variant="h5" color="textSecondary" className="mb-16">
							주식 차트가 없습니다.
						</Typography>
					</FuseAnimate>

					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							주식 차트는 상장 기업에만 제공됩니다.
						</Typography>
					</FuseAnimate>
				</div>
			</div>
		);
	}

	if (stock_code && (!entities || entities.length === 0)) {
		return <SpinLoading />;
	}

	return (
		<Paper className="rounded-8 shadow h-384 w-full p-16 items-center justify-center">
			<div className="flex items-center justify-between pl-4">
				{today && (
					<div className="flex items-center">
						<Typography className="font-500 text-24">{today.price}</Typography>
						<div className="flex flex-row items-center">
							<Icon className={today.color}>{today.icon}</Icon>
							<div className={clsx(today.color, 'mx-8')}>
								{today.increase} ({today.percent})
							</div>
						</div>
					</div>
				)}
				<div className="items-center">
					{chartTypes.map(({ name, text }) => {
						return (
							<Button
								key={name}
								className={clsx(
									'shadow-none px-16',
									currentRange === name ? 'font-bold' : 'font-normal'
								)}
								onClick={() => handleChangeRange(name)}
								color="default"
								variant={currentRange === name ? 'contained' : 'text'}
							>
								{text}
							</Button>
						);
					})}
				</div>
			</div>
			<div id="main" className="w-full h-320" ref={chartRef}></div>
		</Paper>
	);
}

export default StockChart;
