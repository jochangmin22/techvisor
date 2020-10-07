import React, { useState, useMemo } from 'react';
import SpecContext from '../SpecContext';
import Claims from '../Claims';
import Description from '../Description';

function SpecContainer(props) {
	const { search, searchText, terms } = props;
	const [filtered, setFiltered] = useState('');
	const filteredValue = useMemo(() => ({ filtered, setFiltered }), [filtered, setFiltered]);

	return (
		<SpecContext.Provider value={filteredValue}>
			<div className="flex flex-wrap w-full justify-between">
				<div className="flex w-full md:w-1/2 items-start pr-8">
					<Description search={search} searchText={searchText} terms={terms} />
				</div>
				<div className="flex w-full md:w-1/2 items-start">
					<Claims search={search} searchText={searchText} terms={terms} />
				</div>
			</div>
		</SpecContext.Provider>
	);
}

export default SpecContainer;
