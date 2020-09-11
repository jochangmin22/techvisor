import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import debounce from 'lodash/debounce';
import echarts from 'echarts';
import 'echarts/theme/blue';
import _ from '@lodash';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { ipc } from 'app/main/apps/lib/variables';
import { useTheme } from '@material-ui/core';
import IpcPopover from '../IpcPopover';

function calculateCnt(arr) {
	const filterA = 'ipc요약';

	function ipcSwap(ref) {
		return Object.keys(ipc).includes(ref) ? ref + '(' + ipc[ref].substring(0, 5) + '...)' : ref;
	}

	const result = _.chain(arr)
		.filter(item => !!item[filterA])
		.groupBy(filterA)
		.map((value, key) => ({ name: ipcSwap(key), value: value.length }))
		.orderBy(['value'], ['desc'])
		.splice(0, 12)
		.defaultsDeep({ name: [], value: [] })
		.value();
	return result;
}

function IpcChart(props) {
	const theme = useTheme();
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);

	const [data, setData] = useState(null);

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
				trigger: 'item',
				formatter: '{a} <br/>{b} : {c} ({d}%)'
			},
			legend: {
				orient: 'vertical',
				left: 'right',
				top: 50,
				data: data.map(a => a.name)
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

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full shadow-none">
			<div className="flex justify-center border-b-1">
				<Typography variant="body1" className="my-8">
					IPC 분포
				</Typography>
				<IpcPopover />
			</div>
			<div id="main" className="w-full h-360" ref={chartRef} />
		</Paper>
	);
}

export default IpcChart;
