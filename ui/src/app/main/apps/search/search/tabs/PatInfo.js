import React from 'react';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import LegalStatus from './LegalStatus';
import Quotation from './Quotation';
import Family from './Family';
import BiblioInfo from './components/BiblioInfo';
import HistoryTimeLine from './components/HistoryTimeLine';
import TechnicalSummary from './components/TechnicalSummary';

function PatInfo(props) {
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
					<HistoryTimeLine search={props.search} />
				</div>
				<TechnicalSummary search={props.search} />
				<LegalStatus appNo={props.search.출원번호} />
				<Quotation appNo={props.search.출원번호} />
				<Family search={props.search} />
			</div>
		</FuseAnimateGroup>
	);
}

export default PatInfo;
