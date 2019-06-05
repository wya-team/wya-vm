export const homeConfig = [
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
