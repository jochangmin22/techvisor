import React, { useEffect, useState } from 'react';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FuseUtils from '@fuse/utils/FuseUtils';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector } from 'react-redux';
// import * as Actions from './store/actions';
import SummaryDetail from './SummaryDetail';

function SummaryList(props) {
	// const dispatch = useDispatch();
	const summary = useSelector(({ summaryApp }) => summaryApp.summary.entities);
	// const selectedSummaryIds = useSelector(({ summaryApp }) => summaryApp.summary.selectedSummaryIds);
	const searchText = useSelector(({ summaryApp }) => summaryApp.summary.searchText);
	// const user = useSelector(({ summaryApp }) => summaryApp.user);

	const [filteredData, setFilteredData] = useState(null);

	useEffect(() => {
		function getFilteredArray(entities, searchText) {
			const arr = Object.keys(entities).map(id => entities[id]);
			if (searchText.length === 0) {
				return arr;
			}
			return FuseUtils.filterArrayByString(arr, searchText);
		}

		if (summary) {
			setFilteredData(getFilteredArray(summary, searchText));
		}
	}, [summary, searchText]);

	if (!filteredData) {
		return null;
	}

	if (filteredData.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center h-full">
				<Typography color="textSecondary" variant="h5">
					There are no summary!
				</Typography>
			</div>
		);
	}

	return (
		<FuseAnimate animation="transition.slideUpIn" delay={300}>
			{!summary ? (
				<div className="flex flex-col flex-1 items-center justify-center p-24">
					<Paper className="rounded-full p-48">
						<Icon className="block text-64" color="secondary">
							chat
						</Icon>
					</Paper>
					<Typography variant="h6" className="my-24">
						검색결과
					</Typography>
					<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
						저장하시려면 먼저 건을 선택하세요!..
					</Typography>
				</div>
			) : (
				<SummaryDetail />
			)}
		</FuseAnimate>
	);
}

export default SummaryList;
