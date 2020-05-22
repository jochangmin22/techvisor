import React, { useRef } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';
import Popover from '@material-ui/core/Popover';
import { useTheme } from '@material-ui/core/styles';
import LeftSiderTerms from './searchs/LeftSiderTerms';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	popover: {
		pointerEvents: 'none'
	},
	paper: {
		padding: theme.spacing(1)
	}
}));

function CompanyAppSidebarContent(props) {
	const classes = useStyles();
	const theme = useTheme();
	const termsRef = useRef();

	const handleReset = () => {
		termsRef.current.clearTerms();
	};

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div>
			<div className="flex flex-auto justify-between items-center w-full p-16 pr-8">
				<div className="flex flex-shrink-0 items-center">
					<Typography variant="h6">검색조건</Typography>
					<Icon
						className="ml-8"
						color="action"
						aria-owns={open ? 'mouse-over-popover' : undefined}
						aria-haspopup="true"
						onMouseEnter={handlePopoverOpen}
						onMouseLeave={handlePopoverClose}
					>
						help_outline
					</Icon>
					<Popover
						id="mouse-over-popover"
						className={classes.popover}
						classes={{
							paper: classes.paper
						}}
						open={open}
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left'
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'left'
						}}
						onClose={handlePopoverClose}
						disableRestoreFocus
					>
						<div className="h-auto w-sm p-8">
							<Typography variant="body1" className="mb-4">
								근접검색
							</Typography>
							<Typography variant="caption">
								NEAR, NEARx 순서와 상관없이 최대 x 단어와 떨어져서 일치하는 경우 사용합니다. ADJ, ADJx
								는 NEAR와 같으나 반드시 순서가 같아야 합니다. 예: (안전 ADJ5 벨트) NEAR10 (아기 OR
								어린이)
							</Typography>
							<Typography variant="body1" className="my-4">
								[미구현] 명칭, 요약, 청구항, CPC 검색
							</Typography>
							<Typography variant="caption">
								필드 이름을 이용하여 검색할 수 있습니다. (안전 벨트).TI 는 명칭, .AB 는 요약 그리고
								.CL는 청구항으로 검색합니다. B60R22.CPC 는 정확히 CPC가 일치하는 문서를,
								B60R22/low.CPC는 CPC와 그 하위 CPC 분류가 일치하는 문서를 검색합니다.
							</Typography>
							<Typography variant="body1" className="my-4">
								와일드카드, 절단 검색[현재 후행* 만 지원]
							</Typography>
							<Typography variant="caption">
								검색 할 단어의 와일드 카드 패턴을 지정하십시오. 와일드 카드는 한 단어에서만
								사용가능합니다. 와일드 카드는 ? (0 개 또는 1개의 문자), * 또는 $ (0 개 이상의 문자), $x
								(0에서 x 문자까지) 및 # (정확히 한 문자)까지입니다. 단어 당 와일드 카드 기호는 둘 이상을
								포함 할 수 있습니다 예 : *당류? and 하이드록시*페닐*
							</Typography>
						</div>
					</Popover>
				</div>
				<div>
					<Button
						variant="contained"
						size="small"
						color="default"
						className="p-0 m-0"
						onClick={() => handleReset()}
					>
						초기화
					</Button>

					<IconButton onClick={ev => props.pageLayout.current.toggleLeftSidebar()} size="small">
						<Icon>{theme.direction === 'ltr' ? 'chevron_left' : 'chevron_right'}</Icon>
					</IconButton>
				</div>
			</div>
			<Divider />
			<LeftSiderTerms ref={termsRef} />
		</div>
	);
}

export default CompanyAppSidebarContent;
