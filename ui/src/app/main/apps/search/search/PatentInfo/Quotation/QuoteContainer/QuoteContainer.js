import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import QuoteTree from '../QuoteTree';
import QuoteMap from '../QuoteMap';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { withRouter } from 'react-router-dom';
import FuseAnimate from '@fuse/core/FuseAnimate';

// const columnsA = [
// 	{
// 		Header: '인용',
// 		columns: [
// 			{
// 				Header: '소계',
// 				accessor: '인용소계'
// 			},
// 			{
// 				Header: '논문·외국특허',
// 				accessor: '인용논문외국특허'
// 			},
// 			{
// 				Header: '국내특허',
// 				accessor: '인용국내특허'
// 			}
// 		]
// 	},
// 	{
// 		Header: '피인용',
// 		columns: [
// 			{
// 				Header: '소계',
// 				accessor: '피인용소계'
// 			},
// 			{
// 				Header: '논문·외국특허',
// 				accessor: '피인용논문외국특허'
// 			},
// 			{
// 				Header: '국내특허',
// 				accessor: '피인용국내특허'
// 			}
// 		]
// 	}
// ];

const columnsB = [
	{
		Header: '식별코드',
		accessor: '식별코드',
		className: 'text-12 text-gray-500 text-left',
		sortable: true,
		width: 80
	},
	{
		Header: '국가',
		accessor: '국가',
		className: 'text-12 text-gray-500 text-left',
		sortable: true,
		width: 80
	},
	{
		Header: 'IPC코드',
		accessor: 'IPC코드',
		className: 'text-12 text-left',
		sortable: true,
		width: 80
	},
	{
		Header: '출원번호',
		accessor: '출원번호',
		className: 'text-12 text-left',
		sortable: true,
		width: 150
	},
	{
		Header: '인용참증단계',
		accessor: '인용참증단계',
		className: 'text-12 text-left',
		sortable: true,
		width: 150
	},
	{
		Header: '발명의 명칭',
		accessor: '명칭',
		className: 'text-12 text-left',
		sortable: true,
		width: 300
	},
	{
		Header: '일자',
		accessor: '일자',
		className: 'text-12 text-left',
		sortable: true,
		width: 120
	},
	{
		Header: '출원인',
		accessor: '출원인',
		className: 'text-12 text-left',
		sortable: true,
		width: 150
	}
];

function Quotation(props) {
	const entities = useSelector(({ searchApp }) => searchApp.search.quote);

	// const dataA = useMemo(
	// 	() =>
	// 		entities
	// 			? [
	// 					{
	// 						인용소계: entities.filter(item => item.식별코드 === 'B1').length,
	// 						인용논문외국특허: entities.filter(item => item.식별코드 === 'B1' && item.국가 !== 'KR')
	// 							.length,
	// 						인용국내특허: entities.filter(item => item.식별코드 === 'B1' && item.국가 === 'KR').length,
	// 						피인용소계: entities.filter(item => item.식별코드 === 'F1').length,
	// 						피인용논문외국특허: entities.filter(item => item.식별코드 === 'F1' && item.국가 !== 'KR')
	// 							.length,
	// 						피인용국내특허: entities.filter(item => item.식별코드 === 'F1' && item.국가 === 'KR').length
	// 					}
	// 			  ]
	// 			: [],
	// 	[entities]
	// );
	const dataB = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {}, [dataB]);

	const showFooter = entities && entities.length > 10 ? true : false;

	if (!entities) {
		return <SpinLoading className="h-200" />;
	}

	if (entities && entities.length === 0) {
		return (
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">인용·피인용 특허문헌</Typography>
				<div className="max-w-512 text-center">
					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							조회된 인용·피인용 특허가 없습니다.
						</Typography>
					</FuseAnimate>
				</div>
			</Paper>
		);
	}

	return (
		<>
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">인용·피인용 특허문헌</Typography>
				<div className="px-16">
					<QuoteTree data={dataB} />
				</div>
				<FuseScrollbars className="max-h-512 px-6">
					<EnhancedTable
						columns={columnsB}
						data={dataB}
						size="small"
						showFooter={showFooter}
						// rowClick={false}
						onRowClick={(ev, row) => {
							if (row) {
								props.history.push(`/apps/search/${row.original.출원번호}`);
							}
						}}
					/>
				</FuseScrollbars>
			</Paper>
			<Paper className="w-full h-288 rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">인용도 맵</Typography>
				<FuseScrollbars className="w-full h-216 px-6">
					<QuoteMap appNo={props.appNo} applicant={props.applicant} data={dataB} />
				</FuseScrollbars>
			</Paper>
		</>
	);
}

export default withRouter(Quotation);
