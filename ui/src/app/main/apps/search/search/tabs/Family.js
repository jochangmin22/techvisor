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

function Family(props) {
	const classes = useStyles(props);
	// const dispatch = useDispatch();
	const family = useSelector(({ searchApp }) => searchApp.search.family);

	// useEffect(() => {
	// 	dispatch(Actions.getFamily(props.search.출원번호));
	// }, [props.search.출원번호]);

	return (
		<>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						패밀리 특허 분석
					</h6>
					<h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>패밀리 정보</h6>
					<div className="table-responsive px-16">
						<table className={clsx(classes.table, 'w-full text-justify dense')}>
							<tbody>
								<tr>
									<th className="w-208">패밀리 수</th>
									<td>{family && family.length !== 0 ? family.length : 1}</td>
								</tr>
								<tr>
									<th className="w-208">해외 패밀리 국가 수</th>
									<td>{family && family.length !== 0 ? family.length : 0}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</Paper>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						패밀리 특허문헌
					</h6>
					<div className="table-responsive px-16">
						<table className={clsx(classes.table, 'w-full text-justify dense')}>
							<thead>
								<tr>
									<th className="w-1/12">국가코드</th>
									<th className="w-1/6">문헌번호</th>
									<th className="w-1/12">일자</th>
									<th>발명의명칭</th>
									<th className="w-1/12">IPC</th>
									<th className="w-1/12">CPC</th>
								</tr>
							</thead>
							<tbody>
								{family && family.length !== 0 ? (
									family.map((item, index) => (
										<tr key={index}>
											<td>{item.패밀리국가코드}</td>
											<td>{item.패밀리번호}</td>
											<td>{item.등록번호}</td>
											<td>{item.명칭}</td>
											<td>{item.ipc코드}</td>
											<td>{item.ipc코드}</td>
										</tr>
									))
								) : (
									<tr>
										<td>KR</td>
										<td>{addSeparator(props.search.출원번호, '-', 2, 6)}</td>
										<td>{addSeparator(props.search.등록일자, '.', 4, 6)}</td>
										<td>{props.search.명칭}</td>
										<td>{props.search.ipc코드}</td>
										<td>{props.search.ipc코드}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</Paper>
			<Paper className="w-full rounded-8 shadow mb-16">
				<div className="flex flex-col items-start p-12">
					<h6 className="font-600 text-14 p-16" color="secondary">
						패밀리 맵
					</h6>
					{/* <h6 className={clsx(classes.primaryColor, 'font-600 text-14 px-16 py-8')}>주요 인용 정보</h6>											 */}
				</div>
			</Paper>
		</>
	);
}

export default Family;
