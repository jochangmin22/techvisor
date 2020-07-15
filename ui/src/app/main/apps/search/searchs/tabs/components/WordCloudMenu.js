import { useForm } from '@fuse/hooks';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
// import ChecklistModel from 'app/main/apps/scrumboard/model/ChecklistModel';
import React, { useEffect, useState } from 'react';
import ToolbarMenu from './ToolbarMenu';
import { RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, MenuItem, Select } from '@material-ui/core';

function WordCloudMenu(props) {
	const [anchorEl, setAnchorEl] = useState(null);

	const [value, setValue] = React.useState('구문');

	const { form: menuForm, handleChange, setForm, setInForm } = useForm({ 단위: '구문', 출력수: 100 });

	// const handleChange = event => {
	// 	setValue(event.target.value);
	// };

	function handleMenuOpen(event) {
		setAnchorEl(event.currentTarget);
	}

	function handleMenuClose() {
		setAnchorEl(null);
	}

	function isFormInvalid() {
		// return form.name === '';
		return;
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		if (isFormInvalid()) {
			return;
		}
		// props.onAddCheckList(new ChecklistModel(form));
		handleMenuClose();
	}

	return (
		<div>
			<IconButton color="inherit" onClick={handleMenuOpen}>
				<Icon>more_vert</Icon>
			</IconButton>
			<ToolbarMenu state={anchorEl} onClose={handleMenuClose}>
				<form onSubmit={handleSubmit} className="p-16 flex flex-col">
					<FormControl className="flex" component="fieldset">
						<FormLabel component="legend">키워드 단위</FormLabel>
						<RadioGroup
							aria-label="키워드 단위"
							name="단위"
							value={menuForm.단위}
							onChange={handleChange}
							row
						>
							<FormControlLabel value="구문" control={<Radio />} label="구문" />
							<FormControlLabel value="워드" control={<Radio />} label="워드" />
						</RadioGroup>
					</FormControl>
					<FormControl className="flex min-w-96 mb-24" component="fieldset">
						<FormLabel component="legend">워드 출력수</FormLabel>
						<Select labelId="워드 출력수" name="출력수" value={menuForm.출력수} onChange={handleChange}>
							{[50, 100, 150, 200].map(key => (
								<MenuItem value={key} key={key}>
									{key}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<div className="flex">
						<Button
							color="secondary"
							type="submit"
							size="small"
							disabled={isFormInvalid()}
							variant="contained"
						>
							적용
						</Button>
					</div>
				</form>
			</ToolbarMenu>
		</div>
	);
}

export default WordCloudMenu;

{
	/* <div className="flex flex-row items-center justify-end">
<FormControl className="min-w-136">
	<InputLabel id="검색범위">검색범위</InputLabel>
	<Select labelId="검색범위" value={selectedVolume} onChange={handleSelectedVolume}>
		{['요약', '청구항', '발명의 설명'].map(key => (
			<MenuItem value={key} key={key}>
				{key}
			</MenuItem>
		))}
	</Select>
</FormControl>
<RadioGroup aria-label="anonymous" name="anonymous" value={false} row>
	<FormControlLabel value="true" control={<Radio />} label="Yes" />
	<FormControlLabel value="false" control={<Radio />} label="No" />
</RadioGroup>
</div> */
}
