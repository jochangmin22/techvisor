import React, { useEffect } from 'react';
import 'd3-transition';
import { select } from 'd3-selection';
import ReactWordcloud from 'react-wordcloud';
import randomColor from 'randomcolor';
import { CircularProgress, Typography, Paper } from '@material-ui/core';
import { useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import reducer from 'app/store/reducers';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';

// TODO : 항목 CHIP화 하여 클릭하면 검색옵션에 and 삽입되게
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
	getWordTooltip: word => `"${word.text}" 가 ${word.value} 번 반복.`,
	onWordClick: getCallback('onWordClick'),
	onWordMouseOut: getCallback('onWordMouseOut'),
	onWordMouseOver: getCallback('onWordMouseOver')
};

function WordCloud(props) {
	const wordCloud = useSelector(({ companyApp }) => companyApp.visualtab.wordCloud);

	useEffect(() => {}, [wordCloud]);

	return !wordCloud || wordCloud.length === 0 ? (
		<div className="flex flex-col flex-1 items-center justify-center min-w-320 min-h-288 lg:min-w-640">
			<Typography variant="h6" className="my-24" color="primary">
				Loading ...
			</Typography>
			<CircularProgress size={24} />
		</div>
	) : (
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

export default withReducer('companyApp', reducer)(WordCloud);
