import net from '@utils/net';
import { mapActions } from 'vuex';

// Vue.use(ajax);
export default {
	install(Vue) {
		Vue.prototype.$request = net.ajax;

		Vue.mixin({
			methods: {
				...mapActions(['request'])
			}
		});
	},
};
