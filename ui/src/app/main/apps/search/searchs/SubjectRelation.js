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

function SubjectRelation() {
	const dispatch = useDispatch();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.subjectRelation);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);
	const { topic, vec } = entities;
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	useEffect(() => {
		const [, params] = parseSearchText(searchParams, null);
		const subParams = {
			analysisOptions: analysisOptions
		};

		dispatch(getSubjectRelation({ params, subParams }));
		// eslint-disable-next-line
	}, [dispatch, searchParams, analysisOptions.subjectRelationOptions]);

	useEffect(() => {}, [entities]);

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
				</div>
				{isEmpty ? (
					<EmptyMsg
						icon="blur_linear"
						msg="핵심 주제어"
						text="검색결과가 적어서 분석할 데이터가 부족합니다."
					/>
				) : (
					<>
						<SubjectChips topic={topic} />
						{entities && entities.length !== 0 ? <SubjectTable /> : <SpinLoading delay={20000} />}
					</>
				)}
			</Paper>
		</SubjectContext.Provider>
	);
}

export default SubjectRelation;
