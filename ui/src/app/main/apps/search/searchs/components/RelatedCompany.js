/* eslint-disable */
import React, { useContext } from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SubjectContext from '../SubjectContext';
import clsx from 'clsx';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		height: '68px',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	},
	word: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

const sampleData = [
	{ title: '삼성전자' },
	{ title: '현대' },
	{ title: '셀트리온' },
	{ title: '기아자동차' },
	{ title: '코오롱플라스틱' },
	{ title: '우정바이오' },
	{ title: 'SK텔레콤' },
	{ title: '흥국에프엔비' }
];

function NewsArticles(props) {
	// const { searchNum, topic } = props;
	const classes = useStyles();
	const theme = useTheme();
	// const dispatch = useDispatch();
	// const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);

	// const { setShowLoading } = useContext(SubjectContext);

	const data = React.useMemo(() => sampleData, []);

	return (
		<FuseScrollbars className="flex items-center overflow-x-auto">
			<div className="flex flex-row p-12 pb-0 h-48 flex-wrap items-center">
				<Typography className="text-14 font-bold">관련기업</Typography>
				{data.map(row => (
					<Link
						key={row.title}
						style={{ textDecoration: 'none' }}
						className={clsx(
							'inline text-14 font-400 m-4 px-8 py-4 rounded-4 cursor-pointer hover:bg-indigo-400 focus:outline-none focus:shadow-outline active:bg-indigo-600',
							classes.word
						)}
						to={`/apps/company/${row.title}`}
					>
						{row.title}
					</Link>
				))}
			</div>
		</FuseScrollbars>
	);
}

export default NewsArticles;
