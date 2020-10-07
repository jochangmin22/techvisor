import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FusePageCarded from '@fuse/core/FusePageCarded';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import { Link } from 'react-router-dom';
import Highlighter from 'react-highlight-words';
import reducer from '../store';
import {
	getSearch,
	getQuote,
	getFamily,
	getIpcCpc,
	getRnd,
	getLegal,
	// getRegisterFee,
	// getRightHolder,
	// getApplicant,
	// getApplicantTrend,
	getSimilar,
	resetSearch
} from 'app/main/apps/search/store/searchSlice';

import PatentInfoContainer from './PatentInfo/PatentInfoContainer';
import SpecContainer from './Specification/SpecContainer';
import KeywordContainer from './Keyword/KeywordContainer';
import ApplicantContainer from './Applicant/ApplicantContainer';
import SimilarContainer from './Similar/SimilarContainer';
import GradeContainer from './Grade/GradeContainer';
import AssociateCompany from './AssociateCompany';

const useStyles = makeStyles(theme => ({
	contentCard: {
		backgroundColor: theme.palette.background.default
	}
}));

const TurnOffHightlight = true;

function SearchDetails(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const search = useSelector(({ abroadApp }) => abroadApp.search.search);
	const searchParams = useSelector(({ abroadApp }) => abroadApp.searchs.searchParams);
	const { searchText } = searchParams;
	const terms = [].concat(...searchParams.terms.flatMap(x => x.toString().split(' ').join(',').split(',')));
	const appNo = String(props.match.params.appNo).replace(/-/gi, '');
	const rgNo = search && search.등록번호 !== null && search.등록번호 !== undefined ? search.등록번호 : null;
	// const cusNo = search && search.출원인코드1 !== null && search.출원인코드1 !== undefined ? search.출원인코드1 : null;
	const pageLayout = useRef(null);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		const params = { appNo: appNo };
		dispatch(resetSearch());
		dispatch(getSearch(params));
		dispatch(getQuote(params));
		dispatch(getFamily(params));
		dispatch(getLegal(params));
		dispatch(getSimilar(params));
		dispatch(getIpcCpc(params));
		dispatch(getRnd(params));
		// if (cusNo) {
		// 	const params = { cusNo: cusNo };
		// 	dispatch(getApplicant(params));
		// 	dispatch(getApplicantTrend(params));
		// }
		// if (rgNo) {
		// 	const params = { rgNo: rgNo };
		// 	dispatch(getRegisterFee(params));
		// 	dispatch(getRightHolder(params));
		// }
		// eslint-disable-next-line
	}, [dispatch, props.match.params]);

	function handleChangeTab(event, value) {
		setTabValue(value);
	}

	function onDownload() {
		setTimeout(() => {
			const response = {
				file:
					process.env.REACT_APP_KIPRIS_PDF_URL + (search && search.공고일자 ? 'R' : 'P') + '&applno=' + appNo
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
				<div className="flex flex-1 max-w-5xl items-center justify-between">
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
										appNo
											? process.env.REACT_APP_KIPRIS_DRAW_URL + appNo
											: 'assets/images/ecommerce/product-image-placeholder.png'
									}
									alt={1}
								/>
							</FuseAnimate>
							<div className="flex flex-col min-w-0">
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography className="text-12 sm:text-16 truncate">
										{search && (
											<Highlighter
												searchWords={TurnOffHightlight ? [] : terms}
												autoEscape
												textToHighlight={search.명칭}
											/>
										)}
									</Typography>
								</FuseAnimate>
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography variant="caption">{search && props.match.params.appNo}</Typography>
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
			contentToolbar={
				search && (
					<Tabs
						value={tabValue}
						onChange={handleChangeTab}
						indicatorColor="primary"
						textColor="inherit"
						variant="scrollable"
						scrollButtons="auto"
						classes={{ root: 'max-w-3xl h-48' }}
					>
						<Tab label="특허정보" className="h-48 min-w-160" />
						<Tab label="명세서" className="h-48 min-w-160" />
						<Tab label="키워드" className="h-48 min-w-160" />
						<Tab label="출원인" className="h-48 min-w-160" />
						<Tab label="유사특허" className="h-48 min-w-160" />
						<Tab label="기술등급" className="h-48 min-w-160" />
						<Tab label="연관기업" className="h-48 min-w-160" />
					</Tabs>
				)
			}
			content={
				search && (
					<div className="p-12 max-w-5xl">
						{tabValue === 0 && (
							<PatentInfoContainer search={search} searchText={searchText} terms={terms} />
						)}
						{tabValue === 1 && <SpecContainer search={search} searchText={searchText} terms={terms} />}
						{tabValue === 2 && <KeywordContainer search={search} />}
						{tabValue === 3 && <ApplicantContainer search={search} />}
						{tabValue === 4 && <SimilarContainer appNo={appNo} />}
						{tabValue === 5 && <GradeContainer rgNo={rgNo} />}
						{tabValue === 6 && <AssociateCompany search={search} />}
					</div>
				)
			}
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default withReducer('abroadApp', reducer)(SearchDetails);
