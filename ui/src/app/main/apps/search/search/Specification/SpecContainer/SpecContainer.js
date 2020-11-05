import React, { useState, useMemo } from 'react';
import SpecContext from '../SpecContext';
import Claims from '../Claims';
import Description from '../Description';

function SpecContainer() {
	const [filtered, setFiltered] = useState('');
	const filteredValue = useMemo(() => ({ filtered, setFiltered }), [filtered, setFiltered]);

	return (
		<SpecContext.Provider value={filteredValue}>
			<div className="flex flex-wrap w-full justify-between">
				<div className="flex w-full md:w-1/2 items-start pr-8">
					<Description />
				</div>
				<div className="flex w-full md:w-1/2 items-start">
					<Claims />
				</div>
			</div>
		</SpecContext.Provider>
	);
}

export default SpecContainer;
