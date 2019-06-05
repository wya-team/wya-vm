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
	},
	{
		path: '/home/draggable/alone',
		name: 'home-draggable-alone',
		component: () => import('./modules/home-draggable-alone.vue')
	},
	{
		path: '/home/sortable',
		name: 'home-sortable',
		component: () => import('./modules/home-sortable.vue')
	}
];
