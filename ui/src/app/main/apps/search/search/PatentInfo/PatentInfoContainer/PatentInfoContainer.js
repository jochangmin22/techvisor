import React from 'react';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import LegalStatus from '../LegalStatus';
import QuoteContainer from '../Quotation/QuoteContainer';
import Family from '../Family';
import BiblioInfo from '../BiblioInfo';
import HistoryContainer from '../History/HistoryContainer';
import TechnicalSummary from '../TechnicalSummary';
import Rnd from '../Rnd';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useSelector } from 'react-redux';

function PatentInfoContainer() {
	const search = useSelector(({ searchApp }) => searchApp.search.search);
	return (
		<FuseAnimateGroup
			className="flex h-full w-full"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			{!search ? (
				<SpinLoading />
			) : (
				<div className="flex flex-wrap w-full items-start justify-center">
					<div className="flex w-full h-512 md:w-1/2 md:pr-16">
						<BiblioInfo />
					</div>
					<div className="flex w-full h-512 md:w-1/2">
						<HistoryContainer />
					</div>
					<TechnicalSummary />
					<LegalStatus />
					<QuoteContainer />
					<Family />
					<Rnd />
				</div>
			)}
		</FuseAnimateGroup>
	);
}

export default PatentInfoContainer;
