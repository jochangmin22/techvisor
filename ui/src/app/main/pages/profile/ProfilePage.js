import FusePageSimple from '@fuse/core/FusePageSimple';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React, { useState } from 'react';
import UserInfoTab from './tabs/UserInfoTab';
import UserDownloadTab from './tabs/UserDownloadTab';
import UserPointTab from './tabs/UserPointTab';

function ProfilePage() {
	const [selectedTab, setSelectedTab] = useState(0);

	function handleTabChange(event, value) {
		setSelectedTab(value);
	}

	return (
		<FusePageSimple
			classes={{
				toolbar: 'px-16 sm:px-24'
			}}
			contentToolbar={
				<Tabs
					value={selectedTab}
					onChange={handleTabChange}
					indicatorColor="primary"
					textColor="primary"
					variant="scrollable"
					scrollButtons="off"
					classes={{
						root: 'h-64 w-full'
					}}
				>
					<Tab
						classes={{
							root: 'h-64'
						}}
						label="회원정보"
					/>
					<Tab
						classes={{
							root: 'h-64'
						}}
						label="다운로드"
					/>
					<Tab
						classes={{
							root: 'h-64'
						}}
						label="이용내역"
					/>
				</Tabs>
			}
			content={
				<div className="p-16 sm:p-24">
					{selectedTab === 0 && <UserInfoTab />}
					{selectedTab === 1 && <UserDownloadTab />}
					{selectedTab === 2 && <UserPointTab />}
				</div>
			}
		/>
	);
}

export default ProfilePage;
