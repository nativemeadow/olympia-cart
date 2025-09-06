export type NavData = {
	title: string;
	route: string;
};

export const MainNavData = (): NavData[] => {
	return [
		{
			title: 'Products',
			route: '/',
		},
		{
			title: 'Services',
			route: '/services',
		},
		{
			title: 'Resources',
			route: '/resources',
		},
		{
			title: 'Sustainability',
			route: '/sustainability',
		},
		{
			title: 'FAQ',
			route: '/faq',
		},
		{
			title: 'Contact Us',
			route: '/contact-us',
		},
	];
};
