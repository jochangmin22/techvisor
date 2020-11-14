import React from 'react';
import PropTypes from 'prop-types';
import withClickOutside from 'react-onclickoutside';
import UserMenuItem from 'components/base/UserMenuItem';
import './UserMenu.scss';

const UserMenu = ({ onClick, onLogout, username }) => {
	return (
		<div className="user-menu-wrapper">
			<div className="user-menu-positioner">
				<div className="rotated-square" />
				<div className="user-menu" onClick={onClick}>
					<div className="menu-items">
						<UserMenuItem to={`/@${username}`}>내 벨로그</UserMenuItem>
						<div className="separator" />
						<UserMenuItem to="/write">새 글 작성</UserMenuItem>
						<UserMenuItem to="/saves">임시 글</UserMenuItem>
						<div className="separator" />
						<UserMenuItem to="/settings">설정</UserMenuItem>
						<UserMenuItem onClick={onLogout}>로그아웃</UserMenuItem>
					</div>
				</div>
			</div>
		</div>
	);
};

// $FlowFixMe
export default withClickOutside(UserMenu, {
	handleClickOutside(instance) {
		return instance.props.onClickOutside;
	}
});

UserMenu.propTypes = {
	onClick: PropTypes.func.number,
	onLogout: PropTypes.func.any,
	username: PropTypes.string
};
