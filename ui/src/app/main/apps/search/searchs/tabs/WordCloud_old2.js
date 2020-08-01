import React, { useState, useEffect } from 'react';
import 'd3-transition';
import { select } from 'd3-selection';
import ReactWordcloud from 'react-wordcloud';
import debounce from 'lodash/debounce';
import randomColor from 'randomcolor';
import Paper from '@material-ui/core/Paper';
import { useSelector, useDispatch } from 'react-redux';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import parseSearchText from 'app/main/apps/lib/parseSearchText';
import LeftConfig from '../setLeftConfig';
import * as Actions from '../../store/actions';
import { showMessage } from 'app/store/fuse/messageSlice';
import _ from '@lodash';
import WordCloudToobar from './components/WordCloudToobar';
// import WordCloudFilterMenu from './components/WordCloudFilterMenu';

// TODO : showMessage not showing
// TODO : handleResize
function WordCloud(props) {
	const dispatch = useDispatch();
	const wordCloud = useSelector(({ searchApp }) => searchApp.searchs.wordCloud);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const { defaultFormValue } = LeftConfig;
	const [form, setForm] = useState(searchParams ? searchParams : defaultFormValue);

	// useEffect(() => {
	// 	setForm(searchParams);
	// }, [props]);

	function getCallback(callback) {
		return function (word, event) {
			const isActive = callback !== 'onWordMouseOut';
			const element = event.target;
			const text = select(element);
			text.on('click', () => {
				if (isActive) {
					handleClick(word.text);
				}
			}).transition();
			// .attr("background", "white")
			// .attr("font-size", isActive ? "300%" : "100%")
			// .attr("text-decoration", isActive ? "underline" : "none");
		};
	}

	const callbacks = {
		getWordTooltip: word => `"${word.text}" : ${word.value} 번 반복`,
		onWordClick: getCallback('onWordClick'),
		onWordMouseOut: getCallback('onWordMouseOut'),
		onWordMouseOver: getCallback('onWordMouseOver')
	};

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

		dispatch(setSearchSubmit(true));

		const [newParams] = parseSearchText(form, null);
		dispatch(setSearchParams(newParams));
	}

	const handleResize = debounce(() => {
		getCallback('onWordClick');
		// if (echart) {
		// 	echart.resize();
		// }
	}, 500);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	if (!wordCloud || wordCloud.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow-none">
			<WordCloudToobar />
			{/* <div className="flex flex-col px-8"> */}
			{/* <Tooltip title="워드클라우드 항목설정" placement="bottom"> */}
			{/* <WordCloudFilterMenu /> */}
			{/* </Tooltip> */}
			{/* </div> */}
			<FuseAnimateGroup
				className="flex flex-wrap"
				enter={{
					animation: 'transition.slideUpBigIn'
				}}
			>
				<ReactWordcloud
					options={{
						colors: randomColor({
							count: 20,
							luminosity: 'bright',
							hue: 'blue'
							// luminosity: "bright" // bright, light, dark or random
							// hue: "blue", // red, orange, yellow, green, blue, purple, pink, monochrome or random
						}),
						enableTooltip: true,
						deterministic: false,
						fontFamily: 'Noto Sans KR',
						fontSizes: [15, 60],
						// fontStyle: "normal",
						// fontWeight: "normal",
						paddingTop: 8,
						rotations: 1,
						rotationAngles: [0],
						scale: 'sqrt',
						spiral: 'archimedean'
						// scale: "log",
						// spiral: "rectangular",
						// transitionDuration: 1000
					}}
					callbacks={callbacks}
					words={wordCloud}
					// minSize={[200, 250]}
					// size={[400, 400]}
				/>
			</FuseAnimateGroup>
		</Paper>
	);
}
export default WordCloud;
