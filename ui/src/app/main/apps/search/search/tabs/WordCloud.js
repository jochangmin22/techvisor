import React, { useEffect } from 'react';
import 'd3-transition';
import { select } from 'd3-selection';
import ReactWordcloud from 'react-wordcloud';
import randomColor from 'randomcolor';
import Paper from '@material-ui/core/Paper';
import CircularLoading from '../../components/CircularLoading';

function getCallback(callback) {
	return function(word, event) {
		const isActive = callback !== 'onWordMouseOut';
		const element = event.target;
		const text = select(element);
		text.on('click', () => {
			if (isActive) {
				// window.open(`https://duckduckgo.com/?q=${word.text}`, "_blank");
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

function WordCloud(props) {
	const { wordCloud } = props;

	useEffect(() => {}, [wordCloud]);

	if (!wordCloud || wordCloud.length === 0) {
		return <CircularLoading />;
	}

	return (
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
		</Paper>
	);
}

export default WordCloud;
