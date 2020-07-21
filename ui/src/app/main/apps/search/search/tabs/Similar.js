import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { getSimilar, resetSimilar, updateSimilarModelType } from '../../store/searchSlice';
import { useDispatch, useSelector } from 'react-redux';
import SimilarTable from './SimilarTable';

function Similar(props) {
	const { appNo } = props;
	const dispatch = useDispatch();
	const similar = useSelector(({ searchApp }) => searchApp.search.similar);
	const [simData, setSimData] = useState(null);
	const [modelType, setModelType] = useState('');
	const [showLoading, setShowLoading] = useState(false);

	function handleModelType(event) {
		setModelType(event.target.value);
	}

	useEffect(() => {
		if (similar === null) {
			setSimData(null);
		} else {
			if (similar.entities !== undefined) {
				setSimData(similar.entities);
			}
		}
	}, [similar]);

	useEffect(() => {
		if (modelType) {
			dispatch(updateSimilarModelType(modelType));
			setShowLoading(true);
			dispatch(resetSimilar());
			dispatch(getSimilar({ appNo: appNo, modelType: modelType })).then(() => {
				setShowLoading(false);
			});
		}
	}, [dispatch, appNo, modelType]);

	if (!similar || similar.length === 0) {
		return <SpinLoading />;
	}

	return (
		<FuseAnimateGroup
			className="flex flex-wrap"
			enter={{
				animation: 'transition.slideUpBigIn'
			}}
		>
			<Paper className="w-full h-full rounded-8 shadow">
				<div className="px-12 flex items-center">
					<PopoverMsg
						title="유사특허 목록"
						msg="현재 특허의 내용을 자연어 처리를 통해 가장 유사한 특허목록을 표시합니다."
					/>
					<FormControl>
						<Select className="w-160 px-12" value={modelType} onChange={handleModelType} displayEmpty>
							{['doc2vec', 'cosine simility'].map(key => (
								<MenuItem value={key} key={key}>
									{key}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				{simData && simData.length !== 0 && !showLoading ? (
					<SimilarTable data={simData} />
				) : (
					<SpinLoading delay={20000} className="h-full" />
				)}
			</Paper>
		</FuseAnimateGroup>
	);
}

export default Similar;
