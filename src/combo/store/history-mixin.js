import { cloneDeep } from '../../utils/helper';

export default {
	data() {
		return {
			states: {
				currentSnapshot: 0,
				totalSnapshot: 0
			}
		};
	},
	created() {
		this.historyData = [];
	},
	methods: {
		updateHistory(type, payload) {
			const { currentSnapshot, totalSnapshot } = this.states;
			const { id, original, index, data, revert } = payload;
			const snapshot = {
				type,
				id,
				original,
				index,
				revert,
				data: cloneDeep(data),
			};

			// 继续插入，还是以当前停留位置插入
			currentSnapshot === totalSnapshot 
				? this.historyData.push(snapshot)
				: this.historyData.splice(currentSnapshot, totalSnapshot - currentSnapshot, snapshot);

			this.resetHistorySnapshot();
		},

		/**
		 * 从末尾删除
		 */
		removeHistory(count) {
			if (!count) return;
			let { length } = this.historyData;

			this.historyData.splice(length - count - 1, count);
			this.resetHistorySnapshot();
		},

		resetHistorySnapshot() {
			let { length } = this.historyData;
			this.states.currentSnapshot = length;
			this.states.totalSnapshot = length;
		}
	},
};
