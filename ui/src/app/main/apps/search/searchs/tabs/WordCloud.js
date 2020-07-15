import React, { useRef, useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import 'echarts-wordcloud';
import echarts from 'echarts';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import parseSearchText from '../../inc/parseSearchText';
import LeftConfig from '../setLeftConfig';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from '../../store/actions';
import { showMessage } from 'app/store/actions/fuse';
import _ from '@lodash';
import debounce from 'lodash/debounce';
import randomColor from 'randomcolor';
import WordCloudToobar from './components/WordCloudToobar';

function WordCloud(props) {
	const dispatch = useDispatch();
	const chartRef = useRef(null);
	const entities = useSelector(({ searchApp }) => searchApp.searchs.wordCloud);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const { defaultFormValue } = LeftConfig;
	const [form, setForm] = useState(searchParams ? searchParams : defaultFormValue);
	const [echart, setEchart] = useState(null);

	useEffect(() => {
		if (entities) {
			drawChart();
			// updateChart();
		}
		// eslint-disable-next-line
	}, [entities]);

	function handleClick(value, name = 'terms') {
		const newArray = form[name];
		const newValue = value.trim();
		let existCheck = true;
		newArray.map(arr => {
			if (arr.includes(newValue)) {
				return (existCheck = false);
			}
			return true;
		});
		if (existCheck) {
			newArray.push([newValue]);
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
		setForm(_.set({ ...form }, name, newArray));

		dispatch(Actions.setSearchSubmit(true));

		const [newParams] = parseSearchText(form, null);
		dispatch(Actions.setSearchParams(newParams));
	}

	const drawChart = () => {
		// if (!entities.data) return;

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
			series: [
				{
					type: 'wordCloud',

					// The shape of the "cloud" to draw. Can be any polar equation represented as a
					// callback function, or a keyword present. Available presents are circle (default),
					// cardioid (apple or heart shape curve, the most known polar equation), diamond (
					// alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

					shape: 'pentagon',

					// A silhouette image which the white area will be excluded from drawing texts.
					// The shape option will continue to apply as the shape of the cloud to grow.

					// maskImage: maskImage,
					// maskImage: false,

					// Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
					// Default to be put in the center and has 75% x 80% size.

					left: 'center',
					top: 'center',
					width: '100%',
					height: '100%',
					right: null,
					bottom: null,

					// Text size range which the value in data will be mapped to.
					// Default to have minimum 12px and maximum 60px size.

					sizeRange: [15, 60],

					// Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

					rotationRange: [0, 0],
					rotationStep: 90,

					// size of the grid in pixels for marking the availability of the canvas
					// the larger the grid size, the bigger the gap between words.

					gridSize: 8,

					// set to true to allow word being draw partly outside of the canvas.
					// Allow word bigger than the size of the canvas to be drawn
					drawOutOfBound: false,

					// Global text style
					textStyle: {
						normal: {
							fontFamily: 'Noto Sans KR',
							fontWeight: 'bold',
							// Color can be a callback function or a color string
							color: function () {
								return randomColor({
									luminosity: 'bright',
									hue: 'blue',
									format: 'rgb'
									// luminosity: "bright" // bright, light, dark or random
									// hue: "blue", // red, orange, yellow, green, blue, purple, pink, monochrome or random
								});
							}
							// color: function () {
							// 	// Random color
							// 	return (
							// 		'rgb(' +
							// 		[
							// 			Math.round(Math.random() * 160),
							// 			Math.round(Math.random() * 160),
							// 			Math.round(Math.random() * 160)
							// 		].join(',') +
							// 		')'
							// 	);
							// }
						},
						emphasis: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},

					// Data is an array. Each array item must have name and value property.
					data: entities
					// data: [
					// 	{
					// 		name: 'Farrah Abraham',
					// 		value: 366,
					// 		// Style of single text
					// 		textStyle: {
					// 			normal: {},
					// 			emphasis: {}
					// 		}
					// 	}
					// ]
				}
			]
		};

		// setSeries(option.series);
		// setXAxis(option.xAxis);

		myChart.setOption(option);

		myChart.on('click', param => {
			console.log(param);
			handleClick(param.name);
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
			<WordCloudToobar />
			<div id="main" className="w-full h-360" ref={chartRef}></div>
		</Paper>
	);
}

export default WordCloud;
