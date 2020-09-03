import React, { useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Chip from '@material-ui/core/Chip';
import { withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { resetSearch } from 'app/main/apps/company/store/searchSlice';

function NewsArticles(props) {
	const dispatch = useDispatch();
	const relatedCompany = useSelector(({ searchApp }) => searchApp.searchs.relatedCompany);
	const { corpName, corpCode } = relatedCompany;

	function handleClick(e, corp_code) {
		e.preventDefault();
		dispatch(resetSearch());
		props.history.push(`/apps/company/${corp_code}`);
	}

	const data = useMemo(() => corpName, [corpName]);

	return (
		<FuseScrollbars className="h-36 px-12">
			<div className="flex flex-row flex-wrap h-full items-center py-4">
				<Typography className="text-14 font-bold mr-8">관련기업</Typography>
				{/* <Chip
					key={defaultChipData.corpCode}
					label={defaultChipData.corpName}
					size="small"
					className="mx-4"
					onClick={e => handleClick(e, defaultChipData)}
				/> */}
				{data &&
					data.length > 0 &&
					data.map((_, i) => {
						return (
							<Chip
								key={corpCode[i]}
								label={corpName[i]}
								size="small"
								className="m-4"
								onClick={e => handleClick(e, corpCode[i])}
							/>
						);
					})}
			</div>
		</FuseScrollbars>
	);
}

export default withRouter(NewsArticles);
