import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import parseSearchText from '../../inc/parseSearchText';
// import { updateSubjectRelation, resetSubjectRelationVec } from '../../store/searchsSlice';
import { updateSubjectRelation } from '../../store/searchsSlice';
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
	const { topic, modelType } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	const { setShowLoading } = useContext(SubjectContext);

	function handleClick(value) {
		setShowLoading(true);
		const [, params] = parseSearchText(searchParams, null);
		const subParams = {
			analysisOptions: analysisOptions,
			subjectRelation: { modelType: modelType, keywordvec: value }
		};
		// params.keywordvec = value;
		// params.modelType = modelType;

		// dispatch(resetSubjectRelationVec(topic));
		dispatch(updateSubjectRelation({ params, subParams })).then(() => {
			setShowLoading(false);
		});
		// }
	}

	return topic ? (
		<FuseScrollbars className="flex flex-no-overflow items-center overflow-x-auto">
			<div className={clsx(topic && topic.length > 0 ? '' : 'hidden', classes.root)}>
				{topic.map((value, index) => (
					<Chip label={value} key={value} size="small" onClick={() => handleClick(value)} />
				))}
			</div>
		</FuseScrollbars>
	) : (
		<div />
	);
}

export default SubjectChips;
