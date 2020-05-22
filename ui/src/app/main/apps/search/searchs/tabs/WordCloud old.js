import React, { useEffect } from 'react';
import TagCloud from 'react-tag-cloud';
// import CloudItem from "./CloudItem";
import randomColor from 'randomcolor';
// import words from "./words";
import { CircularProgress, Typography, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from '../../store/actions';
import withReducer from 'app/store/withReducer';
import reducer from 'app/store/reducers';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';

// const styles = {
//     large: {
//         fontSize: 60,
//         fontWeight: "bold"
//     },
//     small: {
//         opacity: 0.7,
//         fontSize: 16
//     }
// };
// TODO : 항목 CHIP화 하여 클릭흐면 검색옵션에 and 삽입되게
function WordCloud(props) {
	const dispatch = useDispatch();

	useEffect(() => {
		if (props.searchText) {
			dispatch(Actions.getWordCloud(props.searchText));
		}
	}, [dispatch, props.searchText]);

	const wordCloud = useSelector(({ searchApp }) => searchApp.searchs.wordCloud);
	// if (!widgets) {
	//     return null;
	// }

	return !wordCloud || wordCloud.length === 0 ? (
		<div className="flex flex-col flex-1 items-center justify-center w-full h-full">
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
			{/* <div className="w-full min-w-400 w-400 min-h-400 h-400"> */}
			<Paper className="w-full rounded-8 shadow-none border-1">
				<TagCloud
					className="tag-cloud min-w-320 min-h-288 lg:min-w-640"
					style={{
						fontFamily: 'Noto Sans KR',
						//fontSize: () => Math.round(Math.random() * 50) + 16,
						fontSize: 30,
						color: () =>
							randomColor({
								hue: 'blue'
							}),
						padding: 5,
						width: '100%',
						height: '100%'
					}}
				>
					{wordCloud.map((item, index) => {
						return (
							<div
								style={{
									height: 25,
									width: 'auto',
									fontSize: item.value
								}}
								key={index}
							>
								{item.text}
							</div>
						);
					})}
				</TagCloud>
			</Paper>
		</FuseAnimateGroup>
	);
}

export default withReducer('searchApp', reducer)(WordCloud);
