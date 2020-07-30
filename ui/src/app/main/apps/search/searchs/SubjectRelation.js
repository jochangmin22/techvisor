import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import SubjectContext from './SubjectContext';
import SubjectChips from './components/SubjectChips';
import SubjectTable from './components/SubjectTable';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import { updateSubjectRelation, resetSubjectRelationVec, updateSubjectRelationModelType } from '../store/searchsSlice';
import parseSearchText from '../inc/parseSearchText';
import SubjectRelatonMenu from './components/SubjectRelationMenu';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

function SubjectRelation(props) {
	const dispatch = useDispatch();
	const { searchText } = props;
	const subjectRelation = useSelector(({ searchApp }) => searchApp.searchs.subjectRelation);
	const { topic, vec } = subjectRelation;
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	const [data, setData] = useState(null);
	const [modelType, setModelType] = useState(subjectRelation.modelType);
	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	// function handleModelType(event) {
	// 	setModelType(event.target.value);
	// }

	useEffect(() => {
		if (subjectRelation === null) {
			setData(null);
		} else {
			if (vec !== undefined) {
				setData(vec);
			}
		}
	}, [subjectRelation]);

	useEffect(() => {
		if (modelType) {
			setShowLoading(true);
			dispatch(updateSubjectRelationModelType(modelType));
			const [, params] = parseSearchText(searchParams, null);
			const subParams = {
				analysisOptions: analysisOptions,
				subjectRelation: { modelType: modelType, keywordvec: '' }
			};
			dispatch(resetSubjectRelationVec(topic));
			dispatch(updateSubjectRelation({ params, subParams })).then(() => {
				setShowLoading(false);
			});
		}
	}, [dispatch, searchParams, topic, modelType, analysisOptions]);

	const isEmpty = !!(!topic && !vec);

	if (!subjectRelation) {
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
						{data && data.length !== 0 && !showLoading ? (
							<SubjectTable data={data} />
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
