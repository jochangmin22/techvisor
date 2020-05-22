import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import { Link } from 'react-router-dom';
import Highlighter from 'react-highlight-words';
import reducer from '../store/reducers';
import * as Actions from '../store/actions';

import PatInfo from './tabs/PatInfo';
import Claims from './tabs/Claims';
import Quotation from './tabs/Quotation';
import Family from './tabs/Family';
import Keyword from './tabs/Keyword';
import Applicant from './tabs/Applicant';
import Similar from './tabs/Similar';
import Grade from './tabs/Grade';
import Associate from './tabs/Associate';

// import { isArray } from "util";

const useStyles = makeStyles(theme => ({
	layoutRoot: {},
	root: {
		flexGrow: 1,
		width: '100%',
		margin: '0 auto'
	},
	content: {
		'& canvas': {
			maxHeight: '100%'
		}
	},
	selectedProject: {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		borderRadius: '8px 0 0 0'
	},
	projectMenuButton: {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		borderRadius: '0 8px 0 0',
		marginLeft: 1
	},
	tabRoot: {
		fontSize: 12,
		fontWeight: 600,
		minWidth: 10
	},
	paper: {
		marginTop: theme.spacing(1),
		width: '100%',
		overflowX: 'auto'
		// marginBottom: theme.spacing(0)
	},
	tableRow: {
		fontSize: 11,
		fontWeight: 600
	},
	tableRowFixed: {
		width: '15%',
		fontSize: 12,
		fontWeight: 600
	}
}));

function CompanyDetails(props) {
	const dispatch = useDispatch();
	const theme = useTheme();
	const search = useSelector(({ companyApp }) => companyApp.search);

	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);

	const { searchText } = searchParams;

	const classes = useStyles(props);
	const pageLayout = useRef(null);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		dispatch(Actions.getSearch(String(props.match.params.companyId).replace(/-/gi, '')));
	}, [dispatch, props.match.params]);

	function handleChangeTab(event, tabValue) {
		setTabValue(tabValue);
	}

	// function handleChangeProject(id) {
	//     setSelectedProject({
	//         id,
	//         menuEl: null
	//     });
	// }

	// function handleOpenProjectMenu(event) {
	//     setSelectedProject({
	//         id: selectedProject.id,
	//         menuEl: event.currentTarget
	//     });
	// }

	// function handleCloseProjectMenu() {
	//     setSelectedProject({
	//         id: selectedProject.id,
	//         menuEl: null
	//     });
	// }

	return (
		<FusePageCarded
			classes={{
				root: classes.layoutRoot,
				// header: "min-h-48 h-48",
				header: 'min-h-72 h-72 sm:h-136 sm:min-h-136',
				toolbar: 'p-0',
				// toolbar: "min-h-128 h-128",
				leftSidebar: 'w-216',
				rightSidebar: 'w-640',
				content: classes.content
			}}
			header={
				// company && (
				// <div className="flex flex-col justify-between flex-1 px-24 pt-24">
				//     <div className="flex justify-between items-start">
				<div className="flex flex-1 w-full items-center justify-between">
					<div className="flex flex-col items-start max-w-full">
						<FuseAnimate animation="transition.slideRightIn" delay={300}>
							<Typography
								className="normal-case flex items-center sm:mb-12"
								component={Link}
								role="button"
								to="/apps/companies"
								color="inherit"
							>
								<IconButton>
									<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}</Icon>
								</IconButton>
								목록으로 돌아가기
							</Typography>
						</FuseAnimate>

						<div className="flex items-center max-w-full">
							<FuseAnimate animation="transition.expandIn" delay={300}>
								<img
									className="w-32 sm:w-48 mr-8 sm:mr-16 rounded"
									src="assets/images/ecommerce/product-image-placeholder.png"
									alt={1}
								/>
							</FuseAnimate>
							<div className="flex flex-col min-w-0">
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography className="text-16 sm:text-20 truncate">
										{search && (
											<Highlighter
												searchWords={searchText.split(' ')}
												autoEscape
												textToHighlight={search.명칭}
											/>
										)}
									</Typography>
								</FuseAnimate>
								<FuseAnimate animation="transition.slideLeftIn" delay={300}>
									<Typography variant="caption">{search && props.match.params.companyId}</Typography>
								</FuseAnimate>
							</div>
						</div>

						{/* <FuseAnimate
                                animation="transition.slideRightIn"
                                delay={300}
                            >
                                <Button
                                    className="whitespace-no-wrap"
                                    variant="contained"
                                    disabled={!canBeSubmitted()}
                                    onClick={() =>
                                        dispatch(Actions.saveProduct(form))
                                    }
                                >
                                    Save
                                </Button>
                            </FuseAnimate> */}

						{/* <Typography className="py-0 sm:py-24" variant="h4">
                                Welcome back, John!
                            </Typography> */}
						<Hidden lgUp>
							<IconButton
								onClick={ev => pageLayout.current.toggleLeftSidebar()}
								aria-label="open left sidebar"
							>
								<Icon>menu</Icon>
							</IconButton>
						</Hidden>
					</div>
				</div>
				// )
			}
			contentToolbar={
				search && (
					//     <Tabs
					//     value={tabValue}
					//     onChange={handleChangeTab}
					//     indicatorColor="primary"
					//     textColor="primary"
					//     variant="scrollable"
					//     scrollButtons="auto"
					//     classes={{root: "w-full h-64"}}
					// >
					//     <Tab className="h-64 normal-case" label="Basic Info"/>
					//     <Tab className="h-64 normal-case" label="Product Images"/>
					//     <Tab className="h-64 normal-case" label="Pricing"/>
					//     <Tab className="h-64 normal-case" label="Inventory"/>
					//     <Tab className="h-64 normal-case" label="Shipping"/>
					// </Tabs>
					<Tabs
						value={tabValue}
						onChange={handleChangeTab}
						indicatorColor="primary"
						textColor="primary"
						variant="scrollable"
						scrollButtons="auto"
						// className="w-full border-b-1 px-24"
						classes={{ root: 'w-full h-64' }}
					>
						<Tab className="h-64 normal-case" label="특허정보" />
						<Tab label="청구항" className="h-64 normal-case" />
						<Tab label="인용도" className="h-64 normal-case" />
						<Tab label="패밀리" className="h-64 normal-case" />
						<Tab label="키워드" className="h-64 normal-case" />
						<Tab label="출원인" className="h-64 normal-case" />
						<Tab label="유사특허" className="h-64 normal-case" />
						<Tab label="기술등급" className="h-64 normal-case" />
						<Tab label="연관기업" className="h-64 normal-case" />
					</Tabs>
				)
			}
			content={
				search && (
					<div className="p-12">
						{tabValue === 0 && <PatInfo company={search} searchText={searchText} />}
						{tabValue === 1 && <Claims company={search} searchText={searchText} />}
						{tabValue === 2 && <Quotation company={search} />}
						{tabValue === 3 && <Family company={search} />}
						{tabValue === 4 && <Keyword company={search} />}
						{tabValue === 5 && <Applicant company={search} />}
						{tabValue === 6 && <Similar company={search} />}
						{tabValue === 7 && <Grade company={search} />}
						{tabValue === 8 && <Associate company={search} />}
					</div>
				)
			}
			// leftSidebarContent={<MainSidebarContent company={company} />}
			// leftSidebarContent={
			//     <FuseAnimateGroup
			//         className="w-full"
			//         enter={{
			//             animation: "transition.slideUpBigIn"
			//         }}
			//     >
			//         <div className="widget w-full p-12">
			//             {/* <WidgetNow /> */}
			//         </div>
			//         <div className="widget w-full p-12">
			//             {/* <WidgetWeather widget={widgets.weatherWidget} /> */}
			//         </div>
			//     </FuseAnimateGroup>
			// }

			// rightSidebarContent={
			//     props.match.params.patNo && (
			//         <FuseAnimateGroup
			//             className="w-full"
			//             enter={{
			//                 animation: "transition.slideUpBigIn"
			//             }}
			//         >
			//             <div className="w-full p-12">
			//                 <Iframe
			//                     className="simulator"
			//                     url={
			//                         "http://kpat.kipris.or.kr/kpat/biblio/biblioMain_pdfAcrobat.jsp?method=fullText&pub_reg=" +
			//                         (search && search.공고일자 ? "R" : "P") +
			//                         "&applno=" +
			//                         props.match.params.patNo
			//                     }
			//                     width="620"
			//                     height="820"
			//                     frameborder="0"
			//                     scrolling="yes"
			//                 ></Iframe>
			//             </div>
			//         </FuseAnimateGroup>
			//     )
			// }
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default withReducer('CompanyApp', reducer)(CompanyDetails);
// export default CompanyDetails;
