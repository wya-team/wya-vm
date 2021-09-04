import { cloneDeep } from '../../utils/helper';

export default {
	data() {
		return {
			states: {
				currentSnapshot: 0,
				totalSnapshot: 0,
			}
		};
	},
	created() {
		this.historyData = [];
	},
	methods: {
		/**
		 * TODO: payload 支持数组（组的变化）
		 */
		updateHistory(type, payload) {
			const { currentSnapshot, totalSnapshot } = this.states;
			const { id, original, index, data } = payload;
			const snapshot = {
				type,
				id,
				original,
				index,
				data: cloneDeep(data),
			};

			// 继续插入，还是以当前停留位置插入
			currentSnapshot === totalSnapshot 
				? this.historyData.push(snapshot)
				: this.historyData.splice(currentSnapshot, totalSnapshot - currentSnapshot, snapshot);

			let { length } = this.historyData;
			this.states.currentSnapshot = length;
			this.states.totalSnapshot = length;
		}
	}
};
