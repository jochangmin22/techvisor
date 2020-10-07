import { useForm } from '@fuse/hooks';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ToolbarMenu from 'app/main/apps/lib/ToolbarMenu';
import Tooltip from '@material-ui/core/Tooltip';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useSelector, useDispatch } from 'react-redux';
import { setWordCloudOptions } from 'app/main/apps/search/store/searchsSlice';
import React, { useState } from 'react';

function WordCloudMenu() {
	const dispatch = useDispatch();
	const wordCloudOptions = useSelector(({ abroadApp }) => abroadApp.searchs.analysisOptions.wordCloudOptions);
	const [anchorEl, setAnchorEl] = useState(null);

	const { form, handleChange } = useForm(wordCloudOptions);

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
		dispatch(setWordCloudOptions(form));
		handleMenuClose();
	}

	return (
		<div>
			<Tooltip title="워드클라우드 설정">
				<IconButton onClick={handleMenuOpen}>
					<Icon>more_vert</Icon>
				</IconButton>
			</Tooltip>
			<ToolbarMenu state={anchorEl} onClose={handleMenuClose}>
				<form onSubmit={handleSubmit} className="p-16 flex flex-col">
					<FormControl className="flex min-w-96 mb-24" component="fieldset">
						<FormLabel component="legend">분석범위</FormLabel>
						<Select aria-label="분석범위" name="volume" value={form.volume} onChange={handleChange}>
							{['요약', '청구항', '발명의 설명(추후 지원)'].map(key => (
								<MenuItem value={key} key={key} disabled={key === '발명의 설명(추후 지원)'}>
									{key}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl className="flex" component="fieldset">
						<FormLabel component="legend">키워드 단위</FormLabel>
						<RadioGroup aria-label="키워드 단위" name="unit" value={form.unit} onChange={handleChange} row>
							<FormControlLabel value="구문" control={<Radio />} label="구문" />
							<FormControlLabel value="워드" control={<Radio />} label="워드" />
						</RadioGroup>
					</FormControl>
					<FormControl className="flex min-w-96 mb-24" component="fieldset">
						<FormLabel component="legend">워드 출력수</FormLabel>
						<Select labelId="워드 출력수" name="output" value={form.output} onChange={handleChange}>
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
