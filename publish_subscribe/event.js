const _listen = Symbol('_listen')
const _trigger = Symbol('_trigger')
const _remove = Symbol('_remove')
const _create = Symbol('_create')

class Event {
	cosntructor () {
		// 默认命名空间
		this.default = {}
	}
	/**
	 * 内部事件处理程序，用于订阅事件
	 * @param  {[type]}   key 			事件名
	 * @param  {Function} fn        回调函数
	 * @param  {[type]}   namespace 命名空间
	 */
	_listen (key, fn, namespace) {
		if (!key) return 'event name is not found'
		if (typeof fn !== 'function') return 'event listener is not found'
		if (!this[namespace][key]) {
			this[namespace][key] = []
		}
		this[namespace][key].push(fn)
	}
	/**
	 * 内部事件处理程序，用于发布事件
	 * @param  {[type]}   key 			事件名
	 * @param  {Function} fn        回调函数
	 * @param  {[type]}   namespace 命名空间
	 */
	_trigger (key, namespace, ...args) {
		const fns = this[namespace][key]
		if (!fns || fns.length === 0) {
			return
		}
		for (let i = 0; i < fns.length; i++) {
			const fn = fns[i]
			fn.apply(null, args)
		}
	}
	/**
	 * 内部事件处理程序，用于移除事件
	 * @param  {[type]}   key 			事件名
	 * @param  {Function} fn        回调函数
	 * @param  {[type]}   namespace 命名空间
	 */
	_remove (key, fn, namespace) {
		if (!key) return 'event name is not found'
		const fns = this[namespace][key]
		if (fn === undefined) {
			this[namespace][key] =[]
		} else {
			for (let i = 0; i < fns.length; i++) {
				const _fn = fns[i]
				if (_fn === fn) {
					fns.splice(i, 1)
				}
			}
		}
	}
	/**
	 * 默认命名空间default, 订阅事件
	 * @param  {[type]} 订阅事件名称
	 * @param  {Function} fn  回调函数
	 */
	listen (key, fn) {
		const event = this.create()
		event.listen(key, fn)
	}
	/**
	 * 默认命名空间default, 发布事件
	 * @param  {[type]} 订阅事件名称
	 * @param  {Function} fn  回调函数
	 */
	trigger (...args) {
		const event = this.create()
		event.trigger(...args)
	}
	/**
	 * 默认命名空间default, 移除订阅事件
	 * @param  {[type]} 移除订阅事件名称
	 * @param  {Function} fn  回调函数
	 */
	remove (key, fn) {
		const event = this.create()
		event.remove(key, fn)
	}
	/**
	 * 创建命名空间
	 * @param  {String} namespace 命名空间名称
	 * @return {[type]} 返回订阅、发布、移除事件处理程序
	 */
	create (namespace = 'default') {
		const that = this
		const event = {
			listen (key, fn) {
				that._listen(key, fn, namespace)
			},
			trigger (...args) {
				const key = args.shift()
				that._trigger(key, namespace, ...args)
			},
			remove (key, fn) {
				that._remove(key, fn, namespace)
			}
		}
		// 如果已存在的命名空间，则返回；否则创建
		return this[namespace] ? this[namespace] : (this[namespace] = Object.create(event));
	}
}

module.exports = Event
