import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import { Link } from 'react-router-dom';
import reducer from '../store/reducers';
import * as Actions from '../store/actions';
import searchData from './components/searchData';

import CompanyInfo from './components/CompanyInfo';
import StockChart from './components/StockChart';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const useStyles = makeStyles(theme => ({
	contentCard: {
		backgroundColor: theme.palette.background.default
	}
}));

function SearchDetails(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	// const search = useSelector(({ companyApp }) => companyApp.search.search);
	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	const { searchText } = searchParams;
	// const terms = [].concat(...searchParams.terms.flatMap(x => x.toString().split(' ').join(',').split(',')));
	const companyId = String(props.match.params.companyId).replace(/-/gi, '');
	const pageLayout = useRef(null);
	const [tabValue, setTabValue] = useState(0);

	const [search, setSearch] = useState(searchData);

	useEffect(() => {
		dispatch(Actions.getStock({ kiscode: '005930' }));
		// eslint-disable-next-line
	}, [dispatch, props.match.params]);

	function onDownload() {
		setTimeout(() => {
			const response = {
				file:
					'http://kpat.kipris.or.kr/kpat/biblio/biblioMain_pdfAcrobat.jsp?method=fullText&pub_reg=' +
					(search && search.공고일자 ? 'R' : 'P') +
					'&applno=' +
					companyId
			};
			window.open(response.file);
		}, 100);
	}

	if (!search) {
		return <SpinLoading />;
	}

	return (
		<FusePageCarded
			classes={{
				header: 'min-h-128 h-128 sm:h-136 sm:min-h-136',
				topBg: 'min-h-160 h-160 sm:min-h-192 sm:h-192',
				toolbar: 'p-0 border-b-0',
				contentCard: classes.contentCard,
				leftSidebar: 'w-216',
				rightSidebar: 'w-640'
			}}
			header={
				<div className="flex flex-1 max-w-3xl items-center justify-between">
					<div className="flex flex-col items-start">
						<FuseAnimate animation="transition.slideRightIn" delay={300}>
							<Typography
								className="normal-case flex items-center sm:mb-12"
								component={Link}
								role="button"
								to="/apps/searchs"
								color="inherit"
							>
								<IconButton>
									<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}</Icon>
								</IconButton>
								목록으로 돌아가기
							</Typography>
						</FuseAnimate>

						<div className="flex items-center">
							<FuseAnimate animation="transition.expandIn" delay={300}>
								{/* <IconButton>
									<Icon>picture_as_pdf</Icon>
								</IconButton> */}
								<img
									className="w-32 h-32 sm:w-48 sm:h-48 mr-8 sm:mr-16 rounded"
									src={
										companyId
											? 'http://kpat.kipris.or.kr/kpat/remoteFile.do?method=bigFrontDraw&applno=' +
											  companyId
											: 'assets/images/ecommerce/product-image-placeholder.png'
									}
									alt={1}
								/>
							</FuseAnimate>
							<div className="flex flex-col min-w-0">
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography className="text-12 sm:text-16 truncate">
										{/* {search && (
											<Highlighter searchWords={terms} autoEscape textToHighlight={search.명칭} />
										)} */}
									</Typography>
								</FuseAnimate>
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography variant="caption">{search && props.match.params.companyId}</Typography>
								</FuseAnimate>
							</div>
						</div>
					</div>
					<FuseAnimate animation="transition.slideRightIn" delay={300}>
						<Button
							variant="outlined"
							color="default"
							className="shadow-none px-16"
							size="small"
							startIcon={<SaveAltIcon />}
							onClick={() => onDownload()}
						>
							<Hidden xsDown>Download PDF</Hidden>
							<Hidden smUp>PDF</Hidden>
						</Button>
					</FuseAnimate>
				</div>
			}
			// contentToolbar={
			// search && (
			// 	<Tabs
			// 		value={tabValue}
			// 		onChange={handleChangeTab}
			// 		indicatorColor="primary"
			// 		textColor="inherit"
			// 		variant="scrollable"
			// 		scrollButtons="auto"
			// 		// className="w-full border-b-1 px-24"
			// 		classes={{ root: 'max-w-3xl h-48' }}
			// 	>
			// 		<Tab label="기업상세" className="h-48 min-w-128" />
			// 		{/* <Tab label="청구항" className="h-48 min-w-128" />
			// 		<Tab label="발명의 설명" className="h-48 min-w-128" /> */}
			// 		<Tab label="명세서" className="h-48 min-w-128" />
			// 		<Tab label="키워드" className="h-48 min-w-128" />
			// 		<Tab label="출원인" className="h-48 min-w-128" />
			// 		<Tab label="유사특허" className="h-48 min-w-128" />
			// 		<Tab label="기술등급" className="h-48 min-w-128" />
			// 		<Tab label="연관기업" className="h-48 min-w-128" />
			// 	</Tabs>
			// )
			// }
			content={
				search && (
					<div className="p-12 max-w-3xl">
						<CompanyInfo search={search} />
						<StockChart search={search} />
					</div>
				)
			}
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default withReducer('companyApp', reducer)(SearchDetails);
