import React from 'react';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import LegalStatus from '../LegalStatus';
import QuoteContainer from '../Quotation/QuoteContainer';
import Family from '../Family';
import BiblioInfo from '../BiblioInfo';
import HistoryContainer from '../History/HistoryContainer';
import TechnicalSummary from '../TechnicalSummary';
import Rnd from '../Rnd';

function PatentInfoContainer(props) {
	return (
		<FuseAnimateGroup
			className="flex h-full w-full"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<div className="flex flex-wrap w-full items-start justify-center">
				<div className="flex w-full h-512 md:w-1/2 md:pr-16">
					<BiblioInfo search={props.search} />
				</div>
				<div className="flex w-full h-512 md:w-1/2">
					<HistoryContainer search={props.search} />
				</div>
				<TechnicalSummary search={props.search} />
				<LegalStatus />
				<QuoteContainer appNo={props.search.출원번호} applicant={props.search.출원인1} />
				<Family search={props.search} />
				<Rnd />
			</div>
		</FuseAnimateGroup>
	);
}

export default PatentInfoContainer;
