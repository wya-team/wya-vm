/**
 * 路由变换触发
 */
export default (page) => {
	return {
		destroyed() {
			if (page) {
				this.$store.commit(`${page}_ROUTE_CHANGE`);
			} else {
				this.$store.commit('ROUTE_CHANGE');
			}
		},
	};
};
  