layui.define(['jquery','laytpl'], function (exports) {
  'use strict';
  var $ = layui.jquery
  ,laytpl = layui.laytpl
  
  ,step = {
  	config: {
  		width: '14%'
  	}
  }
  //常量
  ,STEP = 'step' , ERROR = 'error' , SUCCESS = 'success' 
  
  ,STEP_TEMP = function(options){

  	var options = options || {}
  	
  	return ['{{# if(d.data.data.steps.length >= 1 ){ }}'
  						,'{{# layui.each(d.data.data.steps,function(_,__){ }} '
							,'<div class="_item center" style="width: '+options.width+'" >'
							,'{{# if( _+1 > d.data.data.current ){ }}'
			    		,'	<i class="iconfont icon-'+ERROR+' i-sty-'+ERROR+'" style="color:'+options.color.error+'" ></i>'
				    	,'	<div class="'+ERROR+'">'
				    	,'		<p style="color:'+options.color.error+'">{{ __.title }}</p>'
				    	,'		<p style="color:'+options.color.error+'">{{ __.time }}</p>'
				    	,'	</div>'
				    	,'{{# if(d.data.data.current <= _ && d.data.data.steps.length != _+1){ }}'
				    	, '<i class="iconfont icon-changjiantou '+ERROR+' i-m" style="color:'+options.color.error+'!important" ></i>'
				    	,'{{# } }}'
				    	,'{{# }else{ }}'
				    	,'	<i class="iconfont icon-'+SUCCESS+' i-sty-'+SUCCESS+'" style="color:'+options.color.success+'"></i>'
				    	,'	<div class="'+SUCCESS+'">'
				    	,'		<p style="color:'+options.color.success+'">{{ __.title }}</p>'
				    	,'		<p style="color:'+options.color.success+'">{{ __.time }}</p>'
				    	,'	</div>'
					    	,'{{# if(d.data.data.current >= _ && d.data.data.steps.length != _+1){ }}'
					    	, '<i class="iconfont icon-changjiantou '+SUCCESS+' i-m" style="color:'+options.color.success+'!important" ></i>'
					    	,'{{# } }}'
				    	,'{{# } }}'
			    		,'</div>'
							,'{{# }) } }}'].join('');
  }
   //操作当前实例
  ,thisStep = function(){
    var that = this
    ,options = that.config;
    
    return {
      reload: function(options){
        that.reload.call(that, options);
      }
      ,config: options
    }
  }
  ,Class = function(options){
  	 var that = this;
	   that.config = $.extend({}, step.config, that.config, options);
	   that.render();
  };
  
  //默认配置
  Class.prototype.config = {
  	//颜色
		color:{
			success: '#009E94',
			error: '#FF5722'
		}
  };
  //加载
  Class.prototype.render = function() {
    var that = this
    ,options = that.config;
    options.elem = $(options.elem);
    if(!options.elem[0]) throw Error('没有找到'+options.elem.selector+'对应的元素');
		$(laytpl(STEP_TEMP(options)).render({
	      data: options
	    },function(d){
	    	//插入数据
	    	var othis = options.elem;
	    	othis.html(d);
	    	othis.addClass("_ma5");
	  }))
  };
  
  step.ready = function(options){
  	var inst = new Class(options);
  	return thisStep.call(inst);
  }
  layui.link(layui.cache.modules.step.replace(".js",".css"));
  exports(STEP, step);
});