import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import SubjectContext from './SubjectContext';
import SubjectChips from './components/SubjectChips';
import SubjectTable from './components/SubjectTable';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import * as Actions from '../store/actions';
import parseSearchText from '../inc/parseSearchText';

function SubjectRelation(props) {
	const dispatch = useDispatch();
	const { searchText, searchNum } = props;
	const subjectRelation = useSelector(({ searchApp }) => searchApp.searchs.subjectRelation);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const [vecData, setVecData] = useState(null);
	const [modelType, setModelType] = useState(subjectRelation.modelType);
	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	function handlemodelType(event) {
		setModelType(event.target.value);
	}

	// https://stackoverflow.com/questions/28121272/whats-the-best-way-to-update-an-object-in-an-array-in-reactjs
	// data: this.state.data.map(el => (el.id === id ? {...el, text} : el))
	useEffect(() => {
		if (subjectRelation === null) {
			setVecData(null);
		} else {
			if (subjectRelation.vec !== undefined) {
				setVecData(subjectRelation.vec);
			}
		}
	}, [subjectRelation]);

	useEffect(() => {
		if (modelType) {
			dispatch(Actions.updateSubjectRelationModelType(modelType));
			setShowLoading(true);
			const [, newApiParams] = parseSearchText(searchParams, null);
			newApiParams.modelType = modelType;
			dispatch(Actions.resetSubjectRelationVec(subjectRelation.topic));
			dispatch(Actions.updateSubjectRelation(newApiParams)).then(() => {
				setShowLoading(false);
			});
		}
	}, [modelType]);

	if (!subjectRelation || subjectRelation.length === 0) {
		return <SpinLoading />;
	}

	return (
		<SubjectContext.Provider value={showLoadingValue}>
			<Paper className="w-full h-full rounded-8 shadow">
				<div className="px-12 flex items-center">
					<PopoverMsg
						title="핵심 주제어"
						msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 핵심키워드와 비교하여 유사 관계를 표시합니다."
					/>
					<FormControl>
						<Select className="w-128 px-12" value={modelType} onChange={handlemodelType} displayEmpty>
							{['word2vec', 'fasttext', 'btowin'].map(key => (
								<MenuItem value={key} key={key}>
									{key}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<SubjectChips
					searchText={searchText}
					searchNum={searchNum}
					topic={subjectRelation.topic}
					modelType={modelType}
				/>
				{vecData && vecData.length !== 0 && !showLoading ? (
					<SubjectTable data={vecData} />
				) : (
					<SpinLoading delay={20000} />
				)}
			</Paper>
		</SubjectContext.Provider>
	);
}

export default SubjectRelation;
