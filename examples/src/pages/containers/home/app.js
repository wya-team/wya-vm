export const homeConfig = [
	{
		path: '/home',
		redirect: '/home/main'
	},
	{
		path: '/home/main',
		name: 'home-main',
		component: () => import('./modules/home-main.vue')
	},
	{
		path: '/home/basic',
		name: 'home-basic',
		component: () => import('./modules/home-basic.vue')
	},
	{
		path: '/home/draggable',
		name: 'home-draggable',
		component: () => import('./modules/home-draggable.vue')
	}
];
