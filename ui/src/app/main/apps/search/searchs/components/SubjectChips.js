import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
import { getSubjectRelationVec, setSubjectRelationOptions } from '../../store/searchsSlice';
import SubjectContext from '../SubjectContext';

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

function SubjectChips(props) {
	const { topic } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	const { setShowLoading } = useContext(SubjectContext);

	function handleClick(value) {
		setShowLoading(true);
		const subjectRelationOptions = { ...analysisOptions.subjectRelationOptions, keywordvec: value };
		const [, params] = parseSearchOptions(searchParams);
		const subParams = {
			analysisOptions: {
				...analysisOptions,
				subjectRelationOptions
			}
		};
		dispatch(setSubjectRelationOptions(subjectRelationOptions));
		dispatch(getSubjectRelationVec({ params, subParams })).then(() => {
			setShowLoading(false);
		});
	}

	return topic ? (
		<FuseScrollbars className="flex flex-no-overflow items-center overflow-x-auto">
			<div className={clsx(topic && topic.length > 0 ? '' : 'hidden', classes.root)}>
				{topic.map(value => {
					const selectedValue =
						value === analysisOptions.subjectRelationOptions.keywordvec ? 'primary' : 'default';
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

export default SubjectChips;
