import React, { useState } from 'react';
import 'd3-transition';
import { select } from 'd3-selection';
import ReactWordcloud from 'react-wordcloud';
import randomColor from 'randomcolor';
import Paper from '@material-ui/core/Paper';
import { useSelector, useDispatch } from 'react-redux';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import CircularLoading from '../../components/CircularLoading';
import parseSearchText from '../../inc/parseSearchText';
import LeftConfig from '../setLeftConfig';
import * as Actions from '../../store/actions';
import { showMessage } from 'app/store/actions/fuse';
import _ from '@lodash';

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
					// window.open(`https://duckduckgo.com/?q=${word.text}`, '_blank');
				}
			}).transition();
			// .attr("background", "white")
			// .attr("font-size", isActive ? "300%" : "100%")
			// .attr("text-decoration", isActive ? "underline" : "none");
		};
	}

	const callbacks = {
		// getWordColor: word => (word.value > 50 ? "orange" : "purple"),
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

		dispatch(Actions.setSearchSubmit(true));

		const [newParams] = parseSearchText(form, null);
		dispatch(Actions.setSearchParams(newParams));
		// props.history.push('/apps/e-commerce/orders/' + item.id);
	}

	if (!wordCloud || wordCloud.length === 0) {
		return <CircularLoading />;
	}

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<Paper className="w-full h-full rounded-8 shadow-none">
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
				{/* <TagCloud
                    className="tag-cloud min-w-320 min-h-288 lg:min-w-640"
                    style={{
                        fontFamily: "Noto Sans KR",
                        //fontSize: () => Math.round(Math.random() * 50) + 16,
                        fontSize: 30,
                        color: () =>
                            randomColor({
                                hue: "blue"
                            }),
                        padding: 5,
                        width: "100%",
                        height: "100%"
                    }}
                >
                    {wordCloud.map((item, index) => {
                        return (
                            <div
                                style={{
                                    height: 25,
                                    width: "auto",
                                    fontSize: item.value
                                }}
                                key={index}
                            >
                                {item.text}
                            </div>
                        );
                    })}
                </TagCloud> */}
			</Paper>
		</FuseAnimateGroup>
	);
}
export default WordCloud;
// export default withReducer('searchApp', reducer)(WordCloud);
