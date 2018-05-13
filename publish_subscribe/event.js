class Event {
	constructor () {
		this.clientList = []
	}
	listen (key, fn) {
		if (!key) return 'event name is not found'
		if (typeof fn !== 'function') return 'event listener is not found'
		if (!this.clientList[key]) {
			this.clientList[key] = []
		}
		this.clientList[key].push(fn)
	}
	trigger (...args) {
		const key = args.shift()
		const fns = this.clientList[key]
		if (!fns || fns.length === 0) {
			return
		}
		for (let i = 0; i < fns.length; i++) {
			const fn = fns[i]
			fn.apply(null, args)
		}
	}
	remove (key, fn) {
		if (!key) return 'event name is not found'
		const fns = this.clientList[key]
		if (fn === undefined) {
			this.clientList[key] =[]
		} else {
			for (let i = 0; i < fns.length; i++) {
				const _fn = fns[i]
				if (_fn === fn) {
					fns.splice(i, 1)
				}
			}
		}
	}
}
