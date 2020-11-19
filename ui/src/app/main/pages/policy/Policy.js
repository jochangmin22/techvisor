import React from 'react';
import PolicyViewer from './PolicyViewer';

function Policy({ match }) {
	return <PolicyViewer mode={match.params.mode || 'privacy'} />;
}

export default Policy;
