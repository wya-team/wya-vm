import API_ROOT from './apis/root';
/**
 * 根级别actions
 */
import net from '../utils/net';

export const actions = {
	request(store, opts = {}) {
		const {
			url: mutation,
			redirectMutation, // 重定向Mutation
			param = {},
			pending,
			fail,
			loading = true,
			...rest
		} = opts;

		let _mutation = redirectMutation || mutation;

		if (!API_ROOT[mutation]) {
			console.error('[rootActions/request], mutation需要对应的url');
			return !1;
		}
		
		// pending 为 false，则必须要写_PENDING的mutation
		pending && store.commit(`${_mutation}_PENDING`, { param });
		return net.ajax({
			url: API_ROOT[mutation],
			param,
			loading: param.page === undefined ? loading : false,
			...rest
		}).then((res) => {
			const { data } = res;
			store.commit(`${_mutation}_SUCCESS`, {
				data,
				param,
				// ...rest
			});
			return res;
		}).catch((error) => {
			fail && store.commit(`${_mutation}_FAIL`, { param });
			return Promise.reject(error);
		});
	}
};



