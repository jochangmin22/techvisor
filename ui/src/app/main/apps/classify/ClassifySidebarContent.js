import React, { useEffect } from 'react';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useSelector, useDispatch } from 'react-redux';
import { getCategories } from './store/classifySlice';
import ClassifyDictionary from './ClassifyDictionary';

function ClassifySidebarContent(props) {
	const dispatch = useDispatch();
	const dictionaries = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.dictionaries);

	const selectedDictionary = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog.selectedDictionary);

	useEffect(() => {
		dispatch(getCategories());
	}, [dispatch]);

	return (
		<div className="p-0 lg:p-24 lg:pr-4">
			<FuseAnimate animation="transition.slideLeftIn" delay={200}>
				<>
					<div className="px-24 flex items-center">
						<ClassifyDictionary />
					</div>
					<Divider />
					{dictionaries.length === 0 ? (
						<div className="flex flex-col flex-1 items-center justify-center p-24">
							<Paper className="rounded-full p-48">
								<Icon className="block text-64" color="secondary">
									chat
								</Icon>
							</Paper>
							<Typography variant="h6" className="my-24">
								분류사전 선택
							</Typography>
							<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
								시작하시려면 먼저 분류사전을 선택하세요!..
							</Typography>
						</div>
					) : (
						<Typography variant="h6" className="m-24">
							{selectedDictionary}
						</Typography>
					)}
				</>
			</FuseAnimate>
		</div>
	);
}

export default ClassifySidebarContent;
