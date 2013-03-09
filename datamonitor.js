//
  var pTypeOf = Object.prototype.toString;
	var ARR  = '[object Array]',
        OBJ  = '[object Object]',
        STR  = '[object String]',
        FUNC = '[object Function]';
       //
	var DataHelper  = {
		/**
		 * 判断是否两个对象是等价的，不包括对原始数据类型比较,
		 * 在没有key的情况下退化为对原始数据的比较
		 * @author  hite
		 * @version 1.0
		 * @date    2013-02-19
		 * @param   {object}   _object1 [description]
		 * @param   {object}   _object2 [description]
		 * @param   {string/array}   _key     对象的key值,可选参数
		 * @return  {boolean}            是否相同
		 */
		equals:function(_object1,_object2,_key){
			if(_key==null){
				return this.deepEquals(_object2 , _object1);
			}else{
				if(_object2 != null && _object1 != null){
					return _object2[_key] == _object1[_key];
				}
			}
		},
		/**
		 * 数据的深度相同
		 * @author  hite
		 * @version 1.0
		 * @date    2013-03-08
		 * @param   {[type]}   )                   {			var      compare      =             function(source [description]
		 * @param   {[type]}   dest)               {				for(var p            in            source)         {					var    v1 =          source[p];					if(typeof v1               ==    "function") continue;					var v2 =             dest[p];					if(v1 !== v2) {						return false;					}				}				return true;			};			return function(obj1 [description]
		 * @param   {[type]}   obj2)               {				if(obj1 ==           undefined     ||              obj2          == undefined) return                   false;				return (obj1 ===         obj2)             || (compare(obj1 [description]
		 * @param   {[type]}   obj2)               &&            compare(obj2 [description]
		 * @param   {[type]}   obj1));			};		})( [description]
		 * @return  {[type]}                       [description]
		 */
		deepEquals:function(obj1, obj2) {
			if(obj1 == undefined || obj2 == undefined) return false;
			// 
			if(obj1 == obj2 ) return true;

			if(pTypeOf.call(obj1) == OBJ && pTypeOf.call(obj2) == OBJ){
				return $.toJSON(obj2) == $.toJSON(obj1);
			}
			return false;
		}
	};
	
	//
	var DataHolder = $WF.create({
		init:function(_getValueFunc,_saveFunc,_compareFunc){
			var that = this;
			this.save = function(_val){
				// 每次都保存都更新最新的数据
				that.older = _val;
				if(_saveFunc){
					return _saveFunc(that.older);
				}
				return null;
			};
			this.get = _getValueFunc;
			this.compare = _compareFunc;
			//
			this.older = _getValueFunc();
		},
		equals:function(){
			if(this.compare){
				return this.compare(this.older,this.get())
			}else{
				return DataHelper.equals(this.older,this.get());
			}
		}
	});
		
	/**
	 * 监听是否数据发生了变化
	 * <p>
	 * 用来监视是否用户对数据有变化（如设置里的选项），
	 * 格外提供了异步式编程接口，
	 * 典型的场景就是 首页里需要3个ajax请求一起返回之后才处理。
	 * </p>
	 * @type {[type]}
	 */
	var DataMonitor  = $WF.create({
		/**
		 * 初始化
		 * @author  hite
		 * @version 1.0
		 * @date    2013-03-08
		 * @param   {function}   _generalSaveFunc 统一的数据保存接口，
		 *                                        适合场景是，如果当前对象监听的数据，都使用此保存函数，
		 *                                        需要返回 jquery的deferred对象
		 */
		init:function(_generalSaveFunc){
			this.room = [];
			
			this.gSave = _generalSaveFunc;
		},
		/**
		 * 添加需要监听的数据源
		 * @author  hite
		 * @version 1.0
		 * @date    2013-03-08
		 * @param   {function}   _getValueFunc 换成当前数据的接口，返回值任意
		 * @param   {function}   _saveFunc     可选，是否执行save时要保存发生改变的值，
		 *                                     如果有，需要返回 jquery的deferred对象.
		 * @param   {function}   _compareFunc  可选，提供对比新旧值的函数，返回boolean类型
		 *                                     场景场景是，如果当前getValueFunc返回的值为复杂对象时需要传递此函数。
		 *                                     对于原始数据来说是不需要的、
		 *                                     对比复杂对象有 dataHelper函数可以使用
		 */
		watch:function(_getValueFunc,_saveFunc,_compareFunc){
			var holder = new DataHolder(_getValueFunc,_saveFunc,_compareFunc);
			this.room.push(holder);
		},
		/**
		 * 检查是否数据发生变化，如果有相应的savefunc，则同时执行save操作
		 * @author  hite
		 * @version 1.0
		 * @date    2013-03-08
		 * @param   {function}   _done 当所有保存都完成的时候，执行的回调
		 *                             回调的函数，入参是每个 deferred.resolve的参数，
		 *                             数量是发生了变化的量；
		 *                             注意：如果有多个没有对应savefunc的被监听值，
		 *                             会被合并一起，由generalSaveFunc来执行。
		 * @param   {function}   _fail 当不是所有保存完成的时，执行的回调
		 *                             回调的函数，入参是每个 deferred.resolve或者reject的参数，
		 *                             数量是发生了变化的量；
		 *                             注意：如果有多个没有对应savefunc的被监听值，
		 *                             会被合并一起，由generalSaveFunc来执行。
		 * @return  {array}    rawData   如果没有对应的savefunc，包括没有generalSaveFunc；
		 *                               发生变化的数据集
		 */
		save:function(_done,_fail){
			var rawData = [];
			var defers = [];
			if(this.gSave){
				var g = new DataHolder(function(){
					return rawData;
				},this.gSave,function(){
					return rawData.length==0;
				});
				// 最后一个加入
			}
			var result = $.each(g?this.room.concat([g]):this.room,function(index,item){
				if(item.equals()) return true;
				//
				var newValue = item.get();
				var saveFunc = item.save(newValue);
				// 判断是否是deferred对象
				if(saveFunc && typeof saveFunc== "object" && typeof saveFunc.promise == "function") {
					defers.push(saveFunc);
				}else{
					rawData.push(newValue);
				}
			});
			
			$.when.apply(null,defers).then(_done,_fail);
			//
			return rawData
		},
		destroy:function(){

		}
	});
