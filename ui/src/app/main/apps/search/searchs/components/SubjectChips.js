import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import parseSearchText from '../../inc/parseSearchText';
import * as Actions from '../../store/actions';
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
	const { searchNum, topic, modelType } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);

	const { setShowLoading } = useContext(SubjectContext);

	function handleClick(value) {
		// handle both searchText and searchNum
		if (searchNum !== '') {
			setShowLoading(true);
			dispatch(Actions.resetSubjectRelationVec(topic));
			dispatch(Actions.updateSubjectRelation({ searchNum: searchNum, keywordvec: value })).then(() => {
				setShowLoading(true);
			});
		} else {
			setShowLoading(true);
			const [, newApiParams] = parseSearchText(searchParams, null);
			newApiParams.keywordvec = value;
			newApiParams.modelType = modelType;

			dispatch(Actions.resetSubjectRelationVec(topic));
			dispatch(Actions.updateSubjectRelation(newApiParams)).then(() => {
				setShowLoading(false);
			});
		}
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
