window._x1 = 1;
  window._x2 = 2;
	window._x3 = 3;
	var dm = new JY.DataMonitor(function(_newVal){
		return	new $.Deferred(function(_def){
			console.log(_newVal);
			_def.resolve(30);
		});
	});
	dm.watch(function(){
		return window._x1;
	});
	dm.watch(function(){
		return window._x2;
	});
	dm.watch(function(){
		return window._x3;
	},function(_val){
		console.log("c is resolve"+_val);
		var a = new $.Deferred(function(_def){
				_def.resolve(20);
		});
		return a;
	});
	window.tt = function(){
		dm.save(function(){
			console.log("arguments! "+arguments.length);
			console.log(" save all is done!")
		},
		function(){
			console.log(" save all is fial!")
		})
	}
