import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import parseSearchOptions from 'app/main/apps/lib/parseParamsSearch';
import { getKeywordsVec, setKeywordsOptions } from 'app/main/apps/search/store/searchsSlice';
import KeywordsContext from '../KeywordsContext';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		height: '68px',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	}
}));

function KeywordsChips(props) {
	const { topic } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	const { setShowLoading } = useContext(KeywordsContext);

	function handleClick(value) {
		setShowLoading(true);
		const keywordsOptions = { ...analysisOptions.keywordsOptions, keywordvec: value };
		const [, params] = parseSearchOptions(searchParams);
		const subParams = {
			analysisOptions: {
				...analysisOptions,
				keywordsOptions
			}
		};
		dispatch(setKeywordsOptions(keywordsOptions));
		dispatch(getKeywordsVec({ params, subParams })).then(() => {
			setShowLoading(false);
		});
	}

	return topic ? (
		<FuseScrollbars className="flex flex-no-overflow items-center overflow-x-auto">
			<div className={clsx(topic && topic.length > 0 ? '' : 'hidden', classes.root)}>
				{topic.map(value => {
					const selectedValue = value === analysisOptions.keywordsOptions.keywordvec ? 'primary' : 'default';
					return (
						<Chip
							label={value}
							key={value}
							size="small"
							color={selectedValue}
							onClick={() => handleClick(value)}
						/>
					);
				})}
			</div>
		</FuseScrollbars>
	) : (
		<div />
	);
}

export default KeywordsChips;
