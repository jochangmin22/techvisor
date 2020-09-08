import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import reducer from '../../../store';
import withReducer from 'app/store/withReducer';
import { getCompanyInfo } from 'app/main/apps/company/store/searchsSlice';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

import CorpInfo from '../CorpInfo';
import StockChart from '../StockChart';

function CompanyInfoContainer(props) {
	const dispatch = useDispatch();
	const kiscode = useSelector(({ companyApp }) => companyApp.searchs.kiscode);
	const companyInfo = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);

	useEffect(() => {
		if (kiscode) {
			dispatch(getCompanyInfo({ kiscode: kiscode }));
		}
	}, [dispatch, kiscode]);

	if (!companyInfo) {
		return <SpinLoading />;
	}

	return (
		companyInfo && (
			<div className="w-full h-full">
				<CorpInfo companyInfo={companyInfo} />
				<StockChart stock_name={companyInfo.회사명} stock_code={kiscode} />
			</div>
		)
	);
}

export default withReducer('companyApp', reducer)(CompanyInfoContainer);
