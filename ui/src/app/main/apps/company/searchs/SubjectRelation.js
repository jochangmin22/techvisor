import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import SubjectContext from './SubjectContext';
import SubjectChips from './components/SubjectChips';
import SubjectTable from './components/SubjectTable';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PopoverMsg from '../components/PopoverMsg';

function SubjectRelation(props) {
	const { searchText, searchNum } = props;
	const subjectRelation = useSelector(({ companyApp }) => companyApp.searchs.subjectRelation);

	const [vecData, setVecData] = useState(null);

	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

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

	if (!subjectRelation || subjectRelation.length === 0) {
		return <SpinLoading />;
	}

	return (
		<SubjectContext.Provider value={showLoadingValue}>
			<Paper className="w-full h-full rounded-8 shadow">
				<PopoverMsg
					title="핵심 주제어"
					msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 핵심키워드와 비교하여 유사 관계를 표시합니다."
				/>
				<SubjectChips searchText={searchText} searchNum={searchNum} topic={subjectRelation.topic} />
				{vecData && vecData.length !== 0 && !showLoading ? <SubjectTable data={vecData} /> : <SpinLoading />}
			</Paper>
		</SubjectContext.Provider>
	);
}

export default SubjectRelation;
