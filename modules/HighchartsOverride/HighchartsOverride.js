var _o = {},
	_attr = function(name, fn){
		if (typeof name !== 'string') {
			throw new TypeError('传入的参数必须为字符串.');
		}			
		name = name.split('.').filter(function(value){
			return !!value;
		});
		if (!name.length) {
			throw new TypeError('传入的函数名错误.');
		}
		var n = name.pop(),
			o = this;
		while(name.length){
			o = o[name.shift()];
		}
		if (fn) {			// 设置
			o[n] = fn;
		} else {			// 获取
			return o[n];
		}
	},
	_h_attr = function(name, fn){
		return _attr.call(Highcharts, name, fn);
	},
	override = function(fns){
		if (typeof fns !== 'object' && !(fns instanceof Array)) {
			throw new TypeError('传入的参数出错.');
		}
		Object.keys(fns).forEach(function(v){
			var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
				_super = _h_attr(v),
				_this = fns[v];
			_h_attr(v, typeof _super === 'function' && typeof _this === 'function' && fnTest.test(_this) ?
				(function(name, fn){
					return function(){
						var tmp = this._super;
						this._super = _super;
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, _this) : _this);
		}, this);
	};
	
module.exports = override;