import React from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
// import * as Actions from '../../store/actions';

const useStyles = makeStyles(theme => ({
	table: {
		'& th': {
			padding: '4px 0',
			color: theme.palette.primary.main,
			fontWeight: 500
		}
	},
	primaryColor: {
		color: theme.palette.primary.main
	}
}));

function addSeparator(val, separator, p1, p2) {
	return val ? val.slice(0, p1) + separator + val.slice(p1, p2) + separator + val.slice(p2) : '';
}

function LegalStatus(props) {
	const classes = useStyles(props);
	// const dispatch = useDispatch();
	const legal = useSelector(({ searchApp }) => searchApp.search.legal);

	// useEffect(() => {
	// 	dispatch(Actions.getLegal(props.appNo));
	// }, [props.appNo]);

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex flex-col items-start p-12">
				<h6 className="font-600 text-14 p-16" color="secondary">
					법적상태
				</h6>
				<div className="table-responsive h-288 px-16">
					<table className={clsx(classes.table, 'w-full text-justify dense')}>
						<thead>
							<tr>
								<th>일자</th>
								<th>종류</th>
								<th>설명</th>
							</tr>
						</thead>
						<tbody>
							{legal &&
								legal
									// .filter(legal => legal.법적상태명 !== '연차료납부' && legal.법적상태명 !== '등록료납부')
									.map((legal, key) => (
										<tr key={key}>
											<td>{addSeparator(legal.법적상태일자, '.', 4, 6)}</td>
											<td>{legal.법적상태명}</td>
											<td className="max-w-360">{legal.법적상태영문명}</td>
										</tr>
									))}
							<tr>
								<td className="w-100"></td>
								<td className="w-100"></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</Paper>
	);
}

export default LegalStatus;
