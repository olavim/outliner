const isMobile = {
	Android: () => Boolean(navigator.userAgent.match(/Android/i)),
	BlackBerry: () => Boolean(navigator.userAgent.match(/BlackBerry/i)),
	iOS: () => Boolean(navigator.userAgent.match(/iPhone|iPad|iPod/i)),
	Opera: () => Boolean(navigator.userAgent.match(/Opera Mini/i)),
	Windows: () => Boolean(navigator.userAgent.match(/IEMobile/i)),
	any: (): boolean => {
		return Object.keys(isMobile)
			.filter(k => k !== 'any')
			.some(k => isMobile[k as keyof typeof isMobile]());
	}
};

export default isMobile;
