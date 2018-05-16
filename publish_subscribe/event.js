const _listen = Symbol('_listen')
const _trigger = Symbol('_trigger')
const _remove = Symbol('_remove')
const _create = Symbol('_create')

class Event {
	_listen (key, fn, namespace) {
		if (!key) return 'event name is not found'
		if (typeof fn !== 'function') return 'event listener is not found'
		if (!this[namespace][key]) {
			this[namespace][key] = []
		}
		this[namespace][key].push(fn)
	}
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
	_remove (key, namespace, fn) {
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
	listen (key, fn) {
		const event = this.create()
		event.listen(key, fn)
	}
	trigger (...args) {
		const event = this.create()
		event.trigger(...args)
	}
	remove (key, fn) {
		const event = this.create()
		event.remove(key, fn)
	}
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
				that._remove(key, namespace, fn)
			}
		}
		return this[namespace] ? this[namespace] : (this[namespace] = Object.create(event))
	}
}

module.exports = Event
