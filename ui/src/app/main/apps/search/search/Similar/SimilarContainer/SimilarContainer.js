import React, { useState, useLayoutEffect, useMemo } from 'react';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { getSimilar, resetSimilar, updateSimilarModelType } from 'app/main/apps/search/store/searchSlice';
import { useDispatch, useSelector } from 'react-redux';
import SimilarTable from '../SimilarTable';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	label: { backgroundColor: theme.palette.primary.dark }
}));

function SimilarContainer() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ searchApp }) => searchApp.search.similar.entities);
	const appNo = useSelector(({ searchApp }) => searchApp.searchs.selectedAppNo);
	const data = useMemo(() => (entities ? entities : []), [entities]);
	const [modelType, setModelType] = useState('');
	const [showLoading, setShowLoading] = useState(false);

	function handleModelType(event) {
		setModelType(event.target.value);
	}

	useLayoutEffect(() => {
		if (modelType) {
			dispatch(updateSimilarModelType(modelType));
		}
		setShowLoading(true);
		dispatch(resetSimilar());
		dispatch(getSimilar({ appNo: appNo, modelType: modelType })).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [appNo, modelType]);

	const isEmpty = !!(data.length === 0 && !showLoading);

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<div className={clsx(classes.paper, 'h-full w-full rounded-8 shadow py-8')}>
				<div className="flex flex-col w-full sm:flex-row justify-between sm:px-12">
					<div className="flex flex-row items-center p-8 pb-0">
						<PopoverMsg
							title="유사특허 목록"
							msg="현재 특허의 내용을 자연어 처리를 통해 가장 유사한 특허목록을 표시합니다."
						/>
						<FormControl>
							<Select className="w-160 px-12" value={modelType} onChange={handleModelType} displayEmpty>
								{['doc2vec', 'cosine similarity'].map(key => (
									<MenuItem value={key} key={key}>
										{key}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
					<div className="px-12 flex items-center justify-end mb-8">
						<Typography className={clsx(classes.label, 'text-13 font-400 rounded-4 text-white px-8 py-4')}>
							검색 결과 {Number(data.length).toLocaleString()} 건
						</Typography>
					</div>
				</div>
				{isEmpty ? (
					<EmptyMsg
						icon="wb_incandescent"
						msg="검색된 유사특허가 없습니다."
						text="유사도가 높은 특허가 발견되지 않았습니다."
						className="h-360"
					/>
				) : showLoading ? (
					<SpinLoading className="h-360" delay={60000} />
				) : (
					<SimilarTable data={data} />
				)}
			</div>
		</FuseAnimateGroup>
	);
}

export default SimilarContainer;
