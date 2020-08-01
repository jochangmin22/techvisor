import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import SubjectContext from './SubjectContext';
import SubjectChips from './components/SubjectChips';
import SubjectTable from './components/SubjectTable';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import { getSubjectRelation } from '../store/searchsSlice';
import parseSearchText from 'app/main/apps/lib/parseSearchText';
import SubjectRelatonMenu from './components/SubjectRelationMenu';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

function SubjectRelation(props) {
	const dispatch = useDispatch();
	const { searchText } = props;
	const entities = useSelector(({ searchApp }) => searchApp.searchs.subjectRelation);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);
	const { topic, vec } = entities;
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [modelType, setModelType] = useState(analysisOptions.subjectRelationOptions.modelType);
	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	useEffect(() => {
		const [, params] = parseSearchText(searchParams, null);
		const subParams = {
			analysisOptions: analysisOptions
		};
		dispatch(getSubjectRelation({ params, subParams }));
	}, [dispatch, searchParams, analysisOptions.subjectRelationOptions]);

	useEffect(() => {}, [entities]);

	// useEffect(() => {
	// 	if (entities === null) {
	// 		setData(null);
	// 	} else {
	// 		if (vec !== undefined) {
	// 			setData(vec);
	// 		}
	// 	}
	// }, [entities]);

	// useEffect(() => {
	// 	if (modelType) {
	// 		setShowLoading(true);
	// 		dispatch(updateSubjectRelationModelType(modelType));
	// 		const [, params] = parseSearchText(searchParams, null);
	// 		const subParams = {
	// 			subjectRelation: { modelType: modelType, keywordvec: '' }
	// 		};
	// 		dispatch(resetSubjectRelationVec());
	// 		dispatch(getSubjectRelation({ params, subParams })).then(() => {
	// 			setShowLoading(false);
	// 		});
	// 	}
	// }, [dispatch, searchParams, topic, modelType]);

	const isEmpty = !!(!topic && !vec);

	if (!entities) {
		return <SpinLoading />;
	}

	return (
		<SubjectContext.Provider value={showLoadingValue}>
			<Paper className="w-full h-full rounded-8 shadow py-8">
				<div className="px-12 flex items-center justify-between">
					<PopoverMsg
						title="핵심 주제어"
						msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 핵심키워드와 비교하여 유사 관계를 표시합니다."
					/>
					<SubjectRelatonMenu />
					{/* <FormControl>
						<Select className="w-128 px-12" value={modelType} onChange={handleModelType} displayEmpty>
							{['word2vec', 'fasttext', 'btowin'].map(key => (
								<MenuItem value={key} key={key}>
									{key}
								</MenuItem>
							))}
						</Select>
					</FormControl> */}
				</div>
				{isEmpty ? (
					<EmptyMsg
						icon="blur_linear"
						msg="핵심 주제어"
						text="검색결과가 적어서 분석할 데이터가 부족합니다."
					/>
				) : (
					<>
						<SubjectChips searchText={searchText} topic={topic} modelType={modelType} />
						{entities && entities.length !== 0 && !showLoading ? (
							<SubjectTable data={entities.vec} />
						) : (
							<SpinLoading delay={20000} />
						)}
					</>
				)}
			</Paper>
		</SubjectContext.Provider>
	);
}

export default SubjectRelation;
