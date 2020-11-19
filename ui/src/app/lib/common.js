export const pressedEnter = fn => e => {
	if (e.key === 'Enter') {
		fn();
	}
	return null;
};

export const getScrollTop = () => {
	if (!document.body) return 0;
	const scrollTop = document.documentElement
		? document.documentElement.scrollTop || document.body.scrollTop
		: document.body.scrollTop;
	return scrollTop;
};
export const getScrollBottom = () => {
	if (!document.body) return 0;
	const { scrollHeight } = document.body;
	const { innerHeight } = window;
	const scrollTop = getScrollTop();
	return scrollHeight - innerHeight - scrollTop;
};

export const preventStickBottom = () => {
	const scrollBottom = getScrollBottom();
	if (scrollBottom !== 0) return;
	if (document.documentElement) {
		document.documentElement.scrollTop -= 1;
	} else {
		if (!document.body) return;
		document.body.scrollTop -= 1;
	}
};

export const escapeForUrl = text => {
	return text
		.replace(
			/[^0-9a-zA-Zㄱ-힣.\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf -]/g,
			''
		)
		.replace(/ /g, '-')
		.replace(/--+/g, '-');
};

export function loadScript(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.onload = function onload() {
			resolve();
		};
		script.onerror = function onerror() {
			reject();
		};
		script.src = url;
		if (!document || !document.head) return;
		document.head.appendChild(script);
	});
}
