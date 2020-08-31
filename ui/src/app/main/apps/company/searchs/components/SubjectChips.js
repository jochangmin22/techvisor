import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
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
	const { searchNum, topic } = props;
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);

	const { setShowLoading } = useContext(SubjectContext);

	function handleClick(value) {
		// handle both searchText and searchNum
		if (searchNum !== '') {
			setShowLoading(true);
			dispatch(resetSubjectRelationVec());
			dispatch(updateSubjectRelation({ searchNum: searchNum, keywordvec: value })).then(() => {
				setShowLoading(true);
			});
		} else {
			setShowLoading(true);
			const [, newApiParams] = parseSearchOptions(searchParams);
			newApiParams.keywordvec = value; // updateSubjectRelation 에서만 이 line 추가

			dispatch(resetSubjectRelationVec());
			dispatch(updateSubjectRelation(newApiParams)).then(() => {
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
