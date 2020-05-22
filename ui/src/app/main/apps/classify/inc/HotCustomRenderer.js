import React from 'react';

function HotCustomRenderer(props) {
	// The avaiable renderer-related props are:
	// - row (row index)
	// - col (column index)
	// - prop (column property name)
	// - TD (the HTML cell element)
	// - cellProperties (the cellProperties object for the edited cell)
	if (props.value === '1') {
		return <div style={{ background: '#61DAFB' }}>{props.value}</div>;
		// props.TD.className = "bg-blue";
	}
	return <div>{props.value}</div>;
	// props.TD.className = "";

	// return <div>{props.value}</div>;
}

export default HotCustomRenderer;
