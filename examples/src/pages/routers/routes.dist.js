import Vue from 'vue';
import { PRE_ROUTER_URL } from '../constants/constants';
import { homeConfig } from '../containers/home/app';

export const dynamicRoutes = {
	home: homeConfig,
};
export const basicRoutes = {
	base: PRE_ROUTER_URL,
	mode: 'history',
	routes: [
		{
			path: '*',
			redirect: (to) => {
				return '/home';
			}
		}
	]
};
