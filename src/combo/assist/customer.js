export default {
	name: 'vm-customer',
	functional: true,
	inheritAttrs: false,
	props: {
		render: {
			type: Function,
			default: () => (h) => <div />
		}
	},
	render(h, ctx = {}) {
		let { attrs = {} } = ctx.data;
		
		// 其余有很多东西，使用parent吧
		return ctx.props.render(h, attrs, ctx);
	}
};

