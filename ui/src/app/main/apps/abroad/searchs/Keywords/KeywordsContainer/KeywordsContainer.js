import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import KeywordsContext from '../KeywordsContext';
import KeywordsChips from '../KeywordsChips';
import KeywordsMenu from '../KeywordsMenu';
import KeywordsTable from '../KeywordsTable';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import parseSearchOptions from 'app/main/apps/lib/parseParamsSearch';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import { getKeywords } from 'app/main/apps/search/store/searchsSlice';

function KeywordsContainer() {
	const dispatch = useDispatch();
	const keywords = useSelector(({ abroadApp }) => abroadApp.searchs.keywords);
	const { topic, vec } = keywords;
	const analysisOptions = useSelector(({ abroadApp }) => abroadApp.searchs.analysisOptions);
	const searchParams = useSelector(({ abroadApp }) => abroadApp.searchs.searchParams);

	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	useEffect(() => {
		const [, params] = parseSearchOptions(searchParams);
		const subParams = {
			analysisOptions: analysisOptions
		};

		dispatch(getKeywords({ params, subParams }));
		// eslint-disable-next-line
	}, [analysisOptions.keywordsOptions]);

	useEffect(() => {}, [keywords]);

	const isEmpty = !!(!topic && !vec);

	if (!keywords) {
		return <SpinLoading />;
	}

	return (
		<KeywordsContext.Provider value={showLoadingValue}>
			<Paper className="w-full h-full rounded-8 shadow py-8">
				<div className="px-12 flex items-center justify-between">
					<div className="flex flex-row items-center">
						<PopoverMsg
							title="핵심 주제어"
							msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 핵심키워드와 비교하여 유사 관계를 표시합니다."
						/>
						<DraggableIcon />
					</div>
					<KeywordsMenu />
				</div>
				{isEmpty ? (
					<EmptyMsg
						icon="blur_linear"
						msg="검색결과가 너무 적습니다"
						text="검색결과가 적어서 분석할 데이터가 부족합니다."
					/>
				) : (
					<>
						<KeywordsChips topic={topic} />
						{keywords && keywords.length !== 0 ? <KeywordsTable /> : <SpinLoading delay={20000} />}
					</>
				)}
			</Paper>
		</KeywordsContext.Provider>
	);
}

export default KeywordsContainer;
