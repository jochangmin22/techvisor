import React from 'react';
import MainTable from '../MainTable';
import CorpTitleBar from '../CorpTitleBar';

const SearchListContainer = React.forwardRef(function (props, ref) {
	const { selectedCorp } = props;

	return (
		<>
			<MainTable />
			<CorpTitleBar selectedCorp={selectedCorp} ref={ref} />
		</>
	);
});

export default SearchListContainer;
