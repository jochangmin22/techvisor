import React, { useState } from 'react';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import WordCloudMenu from './WordCloudMenu';

function WordCloudToobar() {
	const [currentRange, setCurrentRange] = useState('요약');

	function handleChangeRange(ev) {
		setCurrentRange(ev.target.value);
	}

	return (
		<div className="flex items-center justify-between px-4 pt-4">
			<FormControl className="min-w-96">
				<InputLabel id="검색범위">검색범위</InputLabel>
				<Select labelId="검색범위" value={currentRange} onChange={handleChangeRange}>
					{['요약', '청구항', '발명의 설명'].map(key => (
						<MenuItem value={key} key={key}>
							{key}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<WordCloudMenu />
		</div>
	);
}

export default WordCloudToobar;
