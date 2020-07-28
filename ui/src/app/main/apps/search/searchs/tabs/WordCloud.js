import React, { useRef, useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import 'echarts-wordcloud';
import echarts from 'echarts';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import parseSearchText from '../../inc/parseSearchText';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchSubmit, setSearchParams, initialState } from '../../store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import _ from '@lodash';
import debounce from 'lodash/debounce';
import randomColor from 'randomcolor';
// import WordCloudToobar from './components/WordCloudToobar';
import WordCloudMenu from './components/WordCloudMenu';
import { useUpdateEffect } from '@fuse/hooks';

function WordCloud(props) {
	const dispatch = useDispatch();
	const chartRef = useRef(null);
	const entities = useSelector(({ searchApp }) => searchApp.searchs.wordCloud);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const [form, setForm] = useState(searchParams || initialState.searchParams);
	const [echart, setEchart] = useState(null);

	useEffect(() => {
		if (entities) {
			drawChart();
			// updateChart();
		}
		// eslint-disable-next-line
	}, [entities]);

	function handleClick(chart, value, name = 'terms') {
		chart.setOption({ animation: false });
		let array = [...form[name]];
		const newValue = value.trim().replace(/\s+/g, ' ADJ1 ');
		let existCheck = true;
		array.map(arr => {
			if (arr.includes(newValue)) {
				return (existCheck = false);
			}
			return true;
		});
		if (existCheck) {
			array.push([newValue]);
		} else {
			dispatch(
				showMessage({
					message: '이미 포함되어 있습니다.',
					autoHideDuration: 2000,
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					}
				})
			);
		}
		setForm(_.set({ ...form }, name, array));

		dispatch(setSearchSubmit(true));

		chart.setOption({ animation: true });
		return;
	}

	useUpdateEffect(() => {
		const [_params] = parseSearchText(form, null);
		dispatch(setSearchParams(_params));
	}, [form]);

	const drawChart = () => {
		if (!entities || entities.length === 0) return;

		if (echart) {
			echart.dispose();
			setEchart(null);
		}

		const myChart = echarts.init(chartRef.current);
		setEchart(myChart);

		const option = {
			// animation: true,
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			toolbox: {
				bottom: 10,
				right: 10,
				feature: {
					saveAsImage: {
						show: true,
						name: 'ipgrim 워드클라우드',
						title: '이미지로 저장',
						lang: ['Click to Save']
					}
				}
			},
			series: [
				{
					type: 'wordCloud',
					shape: 'pentagon', // circle, cardioid, diamond, triangle-forward, triangle, pentagon, star
					maskImage: false,
					left: 'center',
					top: 0, //'center',
					width: '90%',
					height: '80%',
					right: null,
					bottom: null,
					sizeRange: [12, 60],
					rotationRange: [0, 0],
					// rotationStep: 90,
					gridSize: 8,
					drawOutOfBound: false,

					// Global text style
					textStyle: {
						normal: {
							fontFamily: 'Noto Sans KR',
							fontWeight: '500',
							// Color can be a callback function or a color string
							color: function () {
								return randomColor({
									luminosity: 'bright', // bright, light, dark or random
									hue: 'blue', // red, orange, yellow, green, blue, purple, pink, monochrome or random
									format: 'rgb'
								});
							}
						},
						emphasis: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},
					data: entities
				}
			]
		};
		myChart.setOption(option);

		myChart.on('click', param => {
			if (param.name) {
				handleClick(myChart, param.name);
			}
		});
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
		<Paper className="w-full h-full rounded-8 shadow-none">
			<div className="flex justify-end">
				<WordCloudMenu />
			</div>
			<div id="main" className="w-full h-360" ref={chartRef}></div>
		</Paper>
	);
}

export default WordCloud;
