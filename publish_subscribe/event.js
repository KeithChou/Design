const _listen = Symbol('_listen')
const _trigger = Symbol('_trigger')
const _remove = Symbol('_remove')
const _each = Symbol('_each')

class Event {
	constructor () {
		this.namespace = {}
	}
	/**
	 * 内部函数，用于执行事件对应的事件处理程序
	 * @param  {[type]}   ary 事件列表
	 * @param  {Function} fn  回调函数
	 */
	_each (ary, fn) {
		let ret = ''
		for (let i = 0; i < ary.length; i++) {
			const n = ary[i]
			ret = fn.call(n, i, n)
		}
		return ret
	}
	/**
	 * 内部订阅者
	 * @param  {[type]}   key   订阅key
	 * @param  {Function} fn    订阅对应的回调
	 * @param  {[type]}   cache 缓存列表
	 */
	_listen (key, fn, cache) {
		if (!cache[key]) {
			cache[key] = []
		}
		cache[key].push(fn)
	}
	/**
	 * 内部发布者
	 * @param  {...[type]} args
	 */
	_trigger (...args) {
		const cache = args.shift()
		const key = args.shift()
		const stack = cache[key]
		const that = this
		if (!stack || !stack.length) {
			return
		}
		return this._each(stack, function () {
			return this.apply(that, args)
		})
	}
	/**
	 * 移除订阅者
	 * @param  {[type]}   key   订阅名
	 * @param  {[type]}   cache 缓存列表
	 * @param  {Function} fn    回调
	 */
	_remove (key, cache, fn) {
		if (cache[key]) {
			if (fn) {
				const fns = cache[key]
				for (let i = 0; i < fns.length; i++) {
					if (fns[i] == fn) {
						fns.splice(i, 1)
					}
				}
			} else {
				cache[key] = []
			}
		}
	}
	/**
	 * 订阅者
	 * @param  {[type]}   key 订阅事件名
	 * @param  {Function} fn  回调
	 */
	listen (key, fn) {
		const event = this.create()
		event.listen(key, fn)
	}
	/**
	 * 发布者
	 * @param  {[type]}   key 发布事件名
	 * @param  {Function} fn  回调
	 */
	trigger (...args) {
		const event = this.create()
		event.trigger(...args);
	}
	/**
	 * 函数执行一次
	 * @param  {[type]}   key 事件名
	 * @param  {Function} fn  回调
	 */
	one (key, fn) {
		const event = this.event()
		event.one(key, fn)
	}
	/**
	 * 移除订阅者
	 * @param  {[type]}   key 订阅名
	 * @param  {Function} fn  回调
	 */
	remove (key, fn) {
		const event = this.create()
		event.remove(key, fn)
	}
	/**
	 * 创建命名空间
	 * @param  {String} name 命名空间名字
	 * @return {[type]}      命名空间下的event实例对象
	 */
	create (name = 'default') {
		const that = this
		const cache = {}
		let offlineStack = [] // 离线事件
		// event对象用于链式调用
		const event = {
			listen (key, fn) {
				that._listen(key, fn, cache)
				if (offlineStack === null) {
					return
				}
				that._each(offlineStack, function () {
					this()
				})
				// 离线事件只允许调用一次
				offlineStack = null
			},
			trigger (...args) {
				args.unshift(cache)
				const fn = () => {
					return that._trigger(...args);
				}
				if (offlineStack) {
					return offlineStack.push(fn)
				}
				return fn()
			},
			one (key, fn) {
				that._remove(key, cache)
				that._listen(key, fn)
			},
			remove (key, fn) {
				that._remove(key, cache, fn)
			}
		}
		return this.namespace[name] ? this.namespace[name] : (this.namespace[name] = Object.create(event));
	}
}