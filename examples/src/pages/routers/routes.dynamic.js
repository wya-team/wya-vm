import { cloneDeep, sortBy } from 'lodash';
import Router from 'vue-router';
import { Storage } from '@utils/utils';
import { TOKEN_KEY } from '@constants/constants';
import Layout from '@components/layout/layout';

class RoutesManager {
	constructor(basicRoutes, dynamicRoutes) {
		this.basicRoutes = basicRoutes;
		this.dynamicRoutes = dynamicRoutes;

		this.router = null;
		this.config = this.init();
	}

	setRouter(router) {
		this.router = router;
	}

	/**
	 * 后端给的字段为token
	 */
	isLoggedIn() {
		return true;
	}

	/**
	 * 初始化路由，如果已经登录过，则生成有权限的路由配置文件，给Router
	 */
	init() {
		let routes = cloneDeep(this.basicRoutes);

		if (this.isLoggedIn()) {
			let children = this.getRoutes();
			let redirect = (children[0] || {}).path || '/404';

			routes.routes.push({
				path: '/',
				component: Layout,
				redirect,
				children
			});
		}
		return routes;
	}

	/**
	 * 一开始没有登录，路由只有/login，登录之后，动态添加
	 */
	reset() {
		// 重新获得有权限的路由
		let children = this.getRoutes() || [];
		let redirect = (children[0] || {}).path || '/404';
		let newRouter = new Router(this.basicRoutes);
		this.router.matcher = newRouter.matcher; // the relevant part
		this.router.addRoutes(
			[
				{
					path: '/',
					component: Layout,
					redirect,
					children
				}
			]
		);
	}

	getRoutes() {
		let dynamicRoutes = cloneDeep(this.dynamicRoutes);
		let allRoutes = Object.keys(dynamicRoutes).reduce((pre, cur) => {
			dynamicRoutes[cur] && pre.push(
				...sortBy(dynamicRoutes[cur], [(v) => v.path.split('/').length, 'sort', 'path'])
			);
			return pre;
		}, []);

		let auth = this.isLoggedIn();

		// 筛选出有权限的路由, 暂时不选
		let authRoutes = allRoutes;
		let temp = [];

		let routes = authRoutes.reduce((pre, route) => {
			// 一、二级路由url如果页面，则不做redirect
			if (route.path.split('/').length < 4) {
				temp.push(route.path);
			}
			let redirect = this.getRedirect(route.path);
			if (redirect) {
				redirect.forEach((path) => {
					if (!temp.includes(path)) {
						temp.push(path);
						pre.push({
							path,
							redirect: route.path
						});
					}
				});
			}

			// 普通路由
			let config = !route.components
				? route
				: {
					...route,
					components: {
						default: () => ({
							component: route.components[0]()
						})
					}
				};

			pre.push(config);
			return pre;
		}, []);

		return routes;
	}

	getRedirect(path) {
		let pathArr = path.split('/');
		let redirect;
		switch (pathArr.length) {
			case 4: // 三级导航
				redirect = [
					`/${pathArr[1]}`,
					`/${pathArr[1]}/${pathArr[2]}`
				];
				break;
			case 3: // 二级导航
				redirect = [
					`/${pathArr[1]}`
				];
				break;
			default: 
				break;
		}

		return redirect;
	}
}

export default RoutesManager;
