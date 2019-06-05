import net from '@utils/net';
import { mapActions } from 'vuex';

// Vue.use(ajax);
export default {
	install(Vue) {
		Vue.prototype.$request = net.ajax;
		// Vue.prototype.$get = net.get;
		// Vue.prototype.$post = net.post;
		// Vue.prototype.$delete = net.delete;
		// Vue.prototype.$put = net.put;
		// Vue.prototype.$form = net.form;
		// Vue.prototype.$jsonp = net.jsonp;

		Vue.mixin({
			methods: {
				...mapActions(['request'])
			}
		});
	},
};
