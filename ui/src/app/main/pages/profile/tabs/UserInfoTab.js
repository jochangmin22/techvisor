import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useSelector } from 'react-redux';

function UserInfoTab() {
	const user = useSelector(({ auth }) => auth.user.data);

	return (
		<div className="md:flex max-w-2xl">
			<div className="flex flex-col flex-1 md:ltr:pr-32 md:rtl:pl-32">
				<FuseAnimateGroup
					enter={{
						animation: 'transition.slideUpBigIn'
					}}
				>
					<Card className="w-full mb-16 rounded-8">
						<AppBar position="static" elevation={0}>
							<Toolbar className="px-8">
								<Typography variant="subtitle1" color="inherit" className="flex-1 px-12">
									계정 정보
								</Typography>
							</Toolbar>
						</AppBar>

						<CardContent>
							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">이름</Typography>
								<Typography>{user.displayName}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">이메일</Typography>
								<Typography>{user.email}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">뉴스레터 수신</Typography>
								<Typography>{user.email}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">SMS 수신</Typography>
								<Typography>{user.email}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">일반전화</Typography>
								<Typography>{user.email}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">휴대폰전화</Typography>
								<Typography>{user.email}</Typography>
							</div>
							<div className="mb-24">
								<Typography className="font-bold mb-4 text-15">주소</Typography>
								<Typography>{user.email}</Typography>
							</div>
						</CardContent>
					</Card>
				</FuseAnimateGroup>
			</div>
		</div>
	);
}
export default UserInfoTab;
