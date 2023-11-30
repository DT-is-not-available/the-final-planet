const extend = {}

extend.symbol = Symbol()

extend.create = function(orig) {
    if (orig[extend.symbol]) return orig
    const func = function(...args) {
        const funcs = func[extend.symbol]
        for (let i = 0; i < funcs.length; i++) {
            funcs[i].apply(this, ...args)
        }
    }
    Object.defineProperty(func, extend.symbol, {
        enumerable: false,
        writable: false,
        value: [orig]
    })
    Object.assign(func.prototype, orig.prototype)
    return func
}

extend.init = function(obj, funcname) {
    return (obj[funcname] = extend.create(obj[funcname]))[extend.symbol]
}

extend.get = function(func) {
    return func[extend.symbol]
}

{
    const arrkeys = Object.getOwnPropertyNames(Array.prototype)
    for (let i = 0; i < arrkeys.length; i++) {
        if (typeof Array.prototype[arrkeys[i]] === "function") {
            extend[arrkeys[i]] = function(func, ...args) {
                Array.prototype[arrkeys[i]].apply(func[extend.symbol], args)
            }
        }
    }
}

const hook = {}

{
    const hooks = new Map

    hook.init = function(obj, propname) {
        const prop = Object.getOwnPropertyDescriptor(obj, propname)
        if (!hooks[obj]) hooks[obj] = {}
        if (hooks[obj][propname]) return hooks[obj][propname]
        if (prop.get || prop.set) throw new Error("Cannot hook a property with getters or setters")
        const hookobj = hooks[obj][propname] = {
            get: [],
            set: [],
        }
        Object.defineProperty(obj, propname, {
            enumerable: prop.enumerable,
            get() {
                console.log(prop.value)
                let ret = prop.value
                for (let i = 0; i < hookobj.get.length; i++) {
                    hookobj.get[i].call(prop.value, function(v) {
                        ret = v
                    })
                }
                return ret
            },
            set(v) {
                if (!prop.writable) throw new TypeError("Property not writable")
                let ret = v
                for (let i = 0; i < hookobj.set.length; i++) {
                    hookobj.set[i].call(prop.value, v, function(v) {
                        ret = v
                    })
                }
                prop.value = ret
                return ret
            }
        })
        return hookobj
    }
    
    hook.access = function(obj, propname, callback) {
        const hookobj = hook.init(obj, propname)
        hookobj.get.push(callback)
    }
    
    hook.write = function(obj, propname, callback) {
        const hookobj = hook.init(obj, propname)
        hookobj.set.push(callback)
    }
}