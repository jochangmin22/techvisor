import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
// import SubjectContext from '../SubjectContext';
import { useSelector } from 'react-redux';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	positiveBackground: { backgroundColor: theme.palette.primary.dark },
	negativeBackground: { backgroundColor: theme.palette.primary.light }
}));

function NewsAnalysis(props) {
	const classes = useStyles();
	const newsSA = useSelector(({ searchApp }) => searchApp.searchs.newsSA);

	// const { setShowLoading } = useContext(SubjectContext);

	const data = useMemo(() => (newsSA === 0 || newsSA < 15 || newsSA > 85 ? 50 : newsSA), [newsSA]);

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<div className="flex flex-col">
			<div className="px-12 flex items-center">
				<PopoverMsg
					title="뉴스분석"
					msg="검색어와 관련하여 머신러닝 기술을 기반으로 최근 100건의 뉴스의 긍정부정을 판단합니다."
				/>
			</div>

			<div className="items-center justify-center w-full h-18 px-8">
				<div className="flex flex-row w-full h-full rounded-4 shadow">
					<div
						className={clsx(
							classes.positiveBackground,
							'h-full items-center justify-center text-center text-11 p-4 text-white'
						)}
						style={{
							width: `${data}%`,
							transition: 'all .2s ease-out'
						}}
					>
						긍정 {data.toFixed(1)}%
					</div>
					<div
						className={clsx(
							classes.negativeBackground,
							'h-full items-center justify-center text-center text-11 p-4 text-white'
						)}
						style={{
							width: `${100 - data}%`,
							transition: 'all .2s ease-out'
						}}
					>
						부정 {(100 - data).toFixed(1)}%
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewsAnalysis;
