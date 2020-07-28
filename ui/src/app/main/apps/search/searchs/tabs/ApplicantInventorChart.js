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
import { nationality } from 'app/main/apps/lib/variables';

function calculateCnt(name, val, arr) {
	const filterType = val === 'A' ? `${name}1` : `${name}국가코드1`;

	function natSwap(ref) {
		return Object.keys(nationality).includes(ref) ? nationality[ref] : ref;
	}

	const result = _.chain(arr)
		.filter(item => !!item[filterType])
		.groupBy(filterType)
		.map((value, key) => ({ name: natSwap(key), value: value.length }))
		.orderBy(['value'], ['desc'])
		.slice(0, 10)
		.defaultsDeep({ name: [], value: [] })
		.value();
	return result;
}

function ApplicantInventorChart(props) {
	const theme = useTheme();
	const { name } = props;
	const chartRef = useRef(null);
	const [echart, setEchart] = useState(null);

	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);

	const [data, setData] = useState({});

	useEffect(() => {
		function updateState(arr) {
			['A', 'B'].map(key => {
				data[key] = calculateCnt(name, key, arr);
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
				trigger: 'item',
				formatter: '{a} <br/>{b}: {c} ({d}%)'
			},
			toolbox: {
				feature: {
					dataView: {
						show: true,
						title: '표로 보기',
						lang: ['표로 보기', '닫기', '갱신'],
						readOnly: false
					},
					restore: { show: true, title: '원래대로' },
					saveAsImage: {
						show: true,
						name: `ipgrim ${name} 차트`,
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			legend: {
				orient: 'vertical',
				left: 'right',
				top: 50,
				data: data.A.map(a => a.name)
			},
			series: [
				{
					name: '지역',
					type: 'pie',
					selectedMode: 'single',
					radius: [0, '30%'],
					center: ['40%', '50%'],
					label: {
						position: 'inner'
					},
					labelLine: {
						show: false
					},
					data: data.B
				},
				{
					name: name,
					type: 'pie',
					radius: ['40%', '55%'],
					center: ['40%', '50%'],
					label: {
						position: 'outer',
						alignTo: 'none',
						bleedMargin: 5
					},
					data: data.A
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
					{name}별
				</Typography>
			</div>
			<div id="main" className="w-full h-360" ref={chartRef} />
		</Paper>
	);
}

export default ApplicantInventorChart;
