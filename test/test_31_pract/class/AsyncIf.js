class AsyncIf {

	#params;
	get params() {return this.#params}

	#events;
	all() {
		return Object.values(this.#params).reduce((a,b)=>a && b)
	}

	check() {
		if (this.all()) {
			this.callEvents()
		}
	}

	constructor(...names) {
		this.#params = Object.fromEntries( names.map(a=>[a,false]) )

		for (let name in this.#params) {
			Object.defineProperty(this,        name, {
				get( )   { return this.#params[name]    ;               },
				set(v)   {        this.#params[name] = v; this.check(); }
			})
		}

		this.#events = [];

		return this;
	}

	addEvent(...func) {
		for (let f of func) {
			this.#events.push(f)
		}

		return this;
	}

	callEvents() {
		for (let f of this.#events) {
			f()
		}
	}

}

export { AsyncIf }