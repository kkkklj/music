$(function(){
//data请求参数
	var startIndex=0;
	var startAdd=12;
	
	function recommendData(data){
		$.each(data,function(i,v){
			// console.log(data);
			var div=$(`<div class="col-4 col-md-3 markk" id="${v.id}">
					<div class="music-box">
						<img src="${v.picUrl}" >
					</div>
					<p>${v.name}</p>
				</div>`);
				$('#g-body').append(div);
		})
	}
	var recommendInfo=localStorage.getItem('recommendInfo');
	if(!recommendInfo){
		$.ajax({
			type:'GET',
			url:'http://www.arthurdon.top:3000/personalized',
			
			// dataType:'jsonp',
			success:function(data){
				// console.log(data);
				localStorage.setItem('recommendInfo',JSON.stringify(data));
				recommendData(data.result.slice(startIndex,startIndex+startAdd));
				startIndex+=startAdd;
			}
		})
	}else{
			var data=JSON.parse(recommendInfo);
			recommendData(data.result.slice(startIndex,startIndex+startAdd));
			// console.log('存在');
			startIndex+=startAdd;
		}
		// console.log(window.screen.height);
		var isHas=true;
	
	var timers=[];
	$('#index').on('scroll',function(){
		// console.log(11)
		if(isHas===false){
			 // console.log('到底');
			return;
		}
		

		var indexThis=this;
		//函数防抖需要保存this指针
		var timer=setTimeout(function(){
			for(var i=1;i<timers.length;i++){
				
				clearTimeout(timers[i]);
			}
			// console.log(this);得到的不是该标签而是整个window
			if(indexThis.scrollTop+indexThis.clientHeight==indexThis.scrollHeight){
						// console.log('触发')
						recommendData(data.result.slice(startIndex,startIndex+startAdd));
						startIndex+=startAdd;
					}
		
					var dalen=data.result.slice(startIndex-startAdd,startIndex).length
					if(dalen<startAdd){
						
						isHas=false;
						
						
					}
					// console.log(scrollTop+667);
					
					// console.log($('.markk').last().offset.top);
			timers=[];
		},500);
		
		timers.push(timer);
		
	})
	$('#close_history').on('click',function(){
		$(this).parent().animate({
			bottom:-100+'rem'
		})
	})
	
	
})