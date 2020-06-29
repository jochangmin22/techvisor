import React from 'react';
import Typography from '@material-ui/core/Typography';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Chip from '@material-ui/core/Chip';
import { withRouter } from 'react-router-dom';
// import SubjectContext from '../SubjectContext';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from '../../../company/store/actions';

// const sampleData2 = {
// 	corpName: ['나노', '나노', '오스코', '오스코', '유한양행', '이노', '코로나', '한양'],
// 	corpCode: ['405171', '994994', '1218749', '961020', '145109', '1226289', '1224634', '162221'],
// 	stockCode: [null, '187790', null, null, '100', null, null, null]
// };

// const defaultChipData = { corpName: '삼성전자', corpCode: '126380', stockCode: '005930' };

function NewsArticles(props) {
	const dispatch = useDispatch();
	const relatedCompany = useSelector(({ searchApp }) => searchApp.searchs.relatedCompany);
	const { corpName, corpCode } = relatedCompany;
	// const { setShowLoading } = useContext(SubjectContext);

	function handleClick(e, corp_code) {
		e.preventDefault();
		dispatch(Actions.resetSearch());
		props.history.push(`/apps/company/${corp_code}`);
	}

	const data = React.useMemo(() => corpName, [corpName]);

	return (
		<FuseScrollbars>
			<div className="flex flex-row p-12 pb-0 h-72 flex-wrap items-center">
				<Typography className="text-14 font-bold">관련기업</Typography>
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
								key={corpName[i]}
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
