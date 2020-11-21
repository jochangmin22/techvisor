import React from 'react';
import TextField from '@material-ui/core/TextField';
import { useAsyncDebounce } from 'react-table';

// Define a default UI for filtering
export function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) {
	const count = preGlobalFilteredRows.length;
	const [value, setValue] = React.useState(globalFilter);
	const onChange = useAsyncDebounce(value => {
		setGlobalFilter(value || undefined);
	}, 200);

	return (
		<span>
			Search:{' '}
			<input
				value={value || ''}
				onChange={e => {
					setValue(e.target.value);
					onChange(e.target.value);
				}}
				placeholder={`${count} records...`}
				style={{
					fontSize: '1.1rem',
					border: '0'
				}}
			/>
		</span>
	);
}

// Define a default UI for filtering
export function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
	const count = preFilteredRows.length;

	return (
		<TextField
			value={filterValue || ''}
			onChange={e => {
				setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
			}}
			placeholder={`총 ${count} 건...`}
			size="small"
		/>
	);
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
	// Calculate the options for filtering
	// using the preFilteredRows
	const options = React.useMemo(() => {
		const options = new Set();
		preFilteredRows.forEach(row => {
			options.add(row.values[id]);
		});
		return [...options.values()];
	}, [id, preFilteredRows]);

	// Render a multi-select box
	return (
		<select
			value={filterValue}
			onChange={e => {
				setFilter(e.target.value || undefined);
			}}
		>
			<option value="">All</option>
			{options.map((option, i) => (
				<option key={i} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
export function SliderColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
	// Calculate the min and max
	// using the preFilteredRows

	const [min, max] = React.useMemo(() => {
		let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		preFilteredRows.forEach(row => {
			min = Math.min(row.values[id], min);
			max = Math.max(row.values[id], max);
		});
		return [min, max];
	}, [id, preFilteredRows]);

	return (
		<>
			<input
				type="range"
				min={min}
				max={max}
				value={filterValue || min}
				onChange={e => {
					setFilter(parseInt(e.target.value, 10));
				}}
			/>
			<button onClick={() => setFilter(undefined)}>Off</button>
		</>
	);
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
export function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }) {
	const [min, max] = React.useMemo(() => {
		let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
		preFilteredRows.forEach(row => {
			min = Math.min(row.values[id], min);
			max = Math.max(row.values[id], max);
		});
		return [min, max];
	}, [id, preFilteredRows]);

	return (
		<div className="flex flex-col mt-8">
			<TextField
				value={typeof filterValue[0] === 'number' ? filterValue[0] : ''}
				type="number"
				onChange={e => {
					const val = e.target.value;
					setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
				}}
				placeholder={`(${min})`}
				// className="w-62"
				size="small"
			/>
			<TextField
				value={typeof filterValue[1] === 'number' ? filterValue[1] : ''}
				type="number"
				onChange={e => {
					const val = e.target.value;
					setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined]);
				}}
				placeholder={`(${max})`}
				// className="w-62"
				size="small"
			/>
		</div>
	);
}
