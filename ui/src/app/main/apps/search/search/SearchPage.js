import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import React, { useEffect, useRef, useState } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Highlighter from 'react-highlight-words';
import reducer from '../store';
import {
	getSearch,
	getQuote,
	getFamily,
	getIpcCpc,
	getRnd,
	getLegal,
	resetSearch
} from 'app/main/apps/search/store/searchSlice';
import FusePageSimple from '@fuse/core/FusePageSimple/FusePageSimple';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import SearchNavigation from './SearchNavigation';
// import SearchPageBreadcrumb from './SearchPageBreadcrumb';
import PatentInfoContainer from './PatentInfo/PatentInfoContainer';
import SpecContainer from './Specification/SpecContainer';
import KeywordContainer from './Keyword/KeywordContainer';
import ApplicantContainer from './Applicant/ApplicantContainer';
import SimilarContainer from './Similar/SimilarContainer';
import GradeContainer from './Grade/GradeContainer';
import AssociateCompany from './AssociateCompany';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		minHeight: '82vh',
		maxHeight: '82vh'
	}
}));

const TurnOffHightlight = true;

function SearchPage() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const search = useSelector(({ searchApp }) => searchApp.search.search);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const appNo = useSelector(({ searchApp }) => searchApp.searchs.selectedAppNo);
	const terms = [].concat(...searchParams.terms.flatMap(x => x.toString().split(' ').join(',').split(',')));

	const rgNo = search && search.등록번호 ? search.등록번호 : null;
	const applicant = search && search['출원인1'] ? search['출원인1'] : null;
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		const params = { appNo: appNo };
		dispatch(resetSearch());
		dispatch(getSearch(params));
		dispatch(getQuote(params));
		dispatch(getFamily(params));
		dispatch(getLegal(params));
		dispatch(getIpcCpc(params));
		dispatch(getRnd(params));
		// eslint-disable-next-line
	}, [dispatch, appNo]);

	const pageLayout = useRef(null);

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

	return (
		<FusePageSimple
			classes={{
				root: classes.root,
				// contentWrapper: 'p-16 md:p-24',
				toolbar: 'p-0 border-b-0',
				content: 'flex flex-col p-16 md:p-24',
				leftSidebar: 'w-200 pt-8',
				header: 'h-64 min-h-64',
				wrapper: 'min-h-0'
			}}
			header={
				<div className="flex items-center justify-start px-4 md:px-12 h-full w-full">
					<Hidden lgUp>
						<IconButton
							onClick={ev => pageLayout.current.toggleLeftSidebar()}
							aria-label="open left sidebar"
						>
							<Icon>menu</Icon>
						</IconButton>
					</Hidden>
					<div className="flex flex-1 items-center sm:justify-start px-8 lg:px-12">
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
								<Typography className="text-12 sm:text-16 truncate">
									{search && (
										<Highlighter
											searchWords={TurnOffHightlight ? [] : terms}
											autoEscape
											textToHighlight={search.영문명칭}
										/>
									)}
								</Typography>
								{/* <Typography variant="caption">{search && props.match.params.appNo}</Typography> */}
							</FuseAnimate>
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
				<div className="flex flex-col">
					{/* <SearchPageBreadcrumb /> */}
					{search && (
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
					)}
				</div>
			}
			content={
				<div className="flex flex-col flex-1 relative">
					{tabValue === 0 && <PatentInfoContainer />}
					{tabValue === 1 && <SpecContainer />}
					{tabValue === 2 && <KeywordContainer />}
					{tabValue === 3 && <ApplicantContainer />}
					{tabValue === 4 && <SimilarContainer />}
					{tabValue === 5 && <GradeContainer rgNo={rgNo} />}
					{tabValue === 6 && <AssociateCompany applicant={applicant} />}
				</div>
			}
			leftSidebarContent={<SearchNavigation appNo={appNo} />}
			// sidebarInner
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default withReducer('searchApp', reducer)(SearchPage);
