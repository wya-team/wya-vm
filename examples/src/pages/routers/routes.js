import layout from '@components/layout/layout';
import { PRE_ROUTER_URL } from '../constants/constants';
import { homeConfig } from '../containers/home/app';

export const routeConfig = {
	base: PRE_ROUTER_URL,
	mode: 'history',
	routes: [
		{
			path: '/',
			component: layout,
			children: [
				{
					path: '',
					redirect: (to) => {
						return '/home/basic';
					}
				},
				...homeConfig
			]
		},
		{
			path: '*',
			redirect: (to) => {
				return '/home/main';
			}
		}
	]
};

