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
	const theme = useTheme();
	const dispatch = useDispatch();
	// const search = useSelector(({ companyApp }) => companyApp.search.search);
	const companyCode = useSelector(({ companyApp }) => companyApp.search.companyCode);

	const { stockCode } = companyCode;

	const companyId = String(props.match.params.companyId).replace(/-/gi, '');
	const pageLayout = useRef(null);

	const [search, setSearch] = useState(searchData);

	useEffect(() => {
		if (stockCode) {
			dispatch(Actions.getStock({ kiscode: stockCode }));
		}
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
			// window.open(response.file);
		}, 100);
	}

	if (!search) {
		return <SpinLoading />;
	}

	return (
		<FusePageCarded
			classes={{
				header: 'min-h-64 h-64 sm:h-64 sm:min-h-64',
				topBg: 'min-h-160 h-160 sm:min-h-192 sm:h-192',
				// toolbar: 'p-0 border-b-0',
				contentCard: classes.contentCard
				// leftSidebar: 'w-216',
				// rightSidebar: 'w-640'
			}}
			header={
				<div className="flex flex-1 max-w-3xl flex-row items-center justify-between">
					<FuseAnimate animation="transition.slideRightIn" delay={300}>
						<Typography
							className="normal-case flex items-center"
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
			content={
				search && (
					<div className="p-12 max-w-3xl">
						<CompanyInfo search={search} companyCode={companyCode} />
						<StockChart search={search} companyCode={companyCode} />
					</div>
				)
			}
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default withReducer('companyApp', reducer)(SearchDetails);
