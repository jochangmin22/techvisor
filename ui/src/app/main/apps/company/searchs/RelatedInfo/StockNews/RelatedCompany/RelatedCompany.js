import React, { useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Chip from '@material-ui/core/Chip';
import { useSelector, useDispatch } from 'react-redux';
import { resetSelectedCorp, setSelectedCorp } from 'app/main/apps/company/store/searchsSlice';

function NewsArticles() {
	const dispatch = useDispatch();
	const relatedCompany = useSelector(({ companyApp }) => companyApp.searchs.relatedCompany);
	const { corpName, stockCode } = relatedCompany;

	function handleClick(e, corpName, stockCode) {
		e.preventDefault();
		dispatch(resetSelectedCorp());
		dispatch(setSelectedCorp({ stockCode: stockCode, corpName: corpName }));
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
								key={stockCode[i]}
								label={corpName[i]}
								size="small"
								className="m-4"
								onClick={e => handleClick(e, corpName[i], stockCode[i])}
							/>
						);
					})}
			</div>
		</FuseScrollbars>
	);
}

export default NewsArticles;
