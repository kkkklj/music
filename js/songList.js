$(function(){
	//用于懒加载
	var songStart=0;
	var songAdd=12;
	//正在播放的歌单id
	var ID;
	//存取播放历史
	var historyArr=[];
	//存取正在播放音乐的ID，在getMusic中获取
	var playingmusicID;
	//正在播放的歌词
	var playingLyric=[];
	//歌词是否轮播判断
	var touchJudge=false;
	
	//记录所有歌词每个p的高度
	var movelyricMoveArr=[];
	//播放状态
	var isPlay=false;
	//曲目。
	var title;
	//正在播放的音乐所处的歌单所有歌曲的id
	var PlaingSongList=[];
	
	var progressTouch=false;
	
	var lock=false;
	//阻断歌词的循环语句
	let t;
	// 随机播放
	var random=false;
	function ReTime(t){
		 var t=t/1000;
		var s=t%60;
		var m=t/60;
		s=parseInt(s);
		m=parseInt(m);
		if(s<10)
		s='0'+s;
		if(m<10)
		m='0'+m;
		return m+':'+s;
	}
	//创建音乐列表
	function showData(data){
// 		console.log('调用')
// 		console.log('data==>',data)
		
		$.each(data,function(i,v){
			var li=$(`<li id=${v.id} class='songLi'>
					<div class="img_box fl">
						<img src="${v.al.picUrl}" />
					</div>
					<div class="music fl">
						<div class="music_name">${v.name}</div>
						<div class="music_about">${v.ar[0].name}</div>
					</div>
					<div class="musicTim fr">${ReTime(v.dt)}</div>
					<i class="yinfu y1"></i>
					<i class="yinfu y2"></i>
					<i class="yinfu y3"></i>
				</li>`);
				$('#list_ul').append(li);
		})
	}
	//获取列表信息
	function getList(id){
		var songListInfo=localStorage.getItem('songListInfo'+id);
		if(!songListInfo){
			$('.loading').css({
				display:'block'
			})
			$.ajax({
				type:'GET',
				url:'http://www.arthurdon.top:3000/playlist/detail?id='+id,
				success:function(data){
					// console.log('SongList==>',data);
					
					// d=data.playlist.tracks;
					// console.log(d);
					localStorage.setItem('songListInfo'+id,JSON.stringify(data));
					$('#lis_sp').text(data.playlist.name);
					data=data.playlist.tracks;
					showData(data.slice(songStart,songStart+ songAdd));
					songStart+=songAdd;
					$('.loading').css({
						display:'none'
					})
				}
			})
		}
		if(songListInfo){
			
			// console.log(JSON.parse(songListInfo));
			var arr=JSON.parse(songListInfo);
			// console.log('arr==>',arr)
			$('#lis_sp').text(arr.playlist.name);
			arr=arr.playlist.tracks;
			showData(arr.slice(songStart,songStart+ songAdd));
			songStart+=songAdd;
			$('.loading').css({
				display:'none'
			})
		}
	}
	//歌单列表点击进入歌曲列表
	$('#g-body').on('click','.markk',function(){
		$('#index').css({
			display:'none'
		})
		$('#music_list').css({
			display:'block'
		})
		// console.log($(this).attr('id'));
		var id=$(this).attr('id');
		//获取歌曲列表
		getList(id);
		//拦截在播放情况下切换歌单导致播放中的歌单被修改
		if(!isPlay){
			ID=id;
		}
		
		//播放状态赋予active
		songLiAct(playingmusicID);
		//头部歌单信息滚动
		var toLef=$('#lis_sp').width()-$('#list_message').width();
		toLef=-toLef;
		// console.log(toLef)
		var to=toLef/100;
		var clea=setInterval(function(){
			// console.log($('#lis_sp').css('marginLeft'));
			if(parseInt($('#lis_sp').css('marginLeft'))>toLef){
				// console.log( $('#lis_sp')[0])
				$('#lis_sp')[0].style.marginLeft=to+'px';
				to--;
			}else{
				// console.log('清除');
				setTimeout(function(){
					$('#lis_sp')[0].style.marginLeft=0+'px';
				},1000)
				
				clearInterval(clea);
				
			}
		},50)
	})
	var musicListTimers=[]
	//歌曲列表滚动（懒加载）
	$('#music_list').on('scroll',function(){
		var indexThis=this;
		var musicListTimer=setTimeout(function(){
			for(var i=1;i<musicListTimers.length;i++){
				clearTimeout(musicListTimers[i])
			}
			// console.log(111);
			var songListInfo=localStorage.getItem('songListInfo'+ID);
			var arr=JSON.parse(songListInfo).playlist.tracks;
			if(indexThis.scrollTop+indexThis.clientHeight==indexThis.scrollHeight){
				showData(arr.slice(songStart,songStart+ songAdd));
				songStart+=songAdd;
				// console.log('触发')
				songLiAct(playingmusicID);
			}
			//清除第一个定时器
			musicListTimers=[];
		},500);
		musicListTimers.push(musicListTimer);
	})
	//歌曲列表返回歌单列表
	$('#back').on('click',function(){
		toHome();
	})
	//获取音乐资源（播放）
	function getMusic(id){
		var music=localStorage.getItem('music'+id);
		//全局播放id绑定
		playingmusicID=id;
		if(!music){
			
			$.ajax({
				type:'GET',
				url:'http://www.arthurdon.top:3000/song/url?id='+id,
				success:function(data){
					localStorage.setItem('music'+id,JSON.stringify(data));
					// console.log('music'+id,data);
					var url=data.data[0].url;
					$('#audio')[0].src=url;
					$('#audio')[0].play();
					
				}
			})
		}else{
			// console.log(music);
			var data=JSON.parse(music);
			var url=data.data[0].url;
			$('#audio')[0].src=url;
			$('#audio')[0].play();
		}
	}
	//点击歌曲播放
	$(document).on('click','.songLi',function(){
		// $('#audio')[0].pause();
// 		console.log(111)
// 		console.log($(this).attr('id'));
		let id=$(this).attr('id');
		// http://www.arthurdon.top:3000/song/url?id=1398294372
		// var url='http://www.arthurdon.top:3000/song/url?id='+id;
		
		getMusic(id);
		var hisOne={};
		hisOne.imgSrc=this.children[0].children[0].src;
		hisOne.name=this.children[1].children[0].innerText;
		hisOne.time=this.children[2].innerText;
		hisOne.id=id;
		title=hisOne.name;
		// console.log(hisOne);
		addHistory(hisOne);
		songLiAct(id);
		
	})
	$(document).on('click','.his_li',function(){
		let id=$(this).attr('id');
		// http://www.arthurdon.top:3000/song/url?id=1398294372
		// var url='http://www.arthurdon.top:3000/song/url?id='+id;
		
		getMusic(id);
		var hisOne={};
		hisOne.imgSrc=this.children[0].children[0].src;
		hisOne.name=this.children[1].innerText;
		hisOne.time=this.children[2].innerText;
		hisOne.id=id;
		title=hisOne.name;
		// console.log(hisOne);
		// addHistory(hisOne);
		songLiAct(id);
		
	})
	//播放事件
	$('#audio')[0].onplay=function(){
		//重置滚动条
		document.getElementById('lyric_box').scrollTop=0;
		$('#play_state').addClass('active');
		$('#music_playing').addClass('active');
		$('#my-musice').addClass('active');
		$('#music_playing').css({
			opacity:'0'
		})
		$('#my-musice').css({
			animationPlayState:"running"
		})
// 		setTimeout(function(){
// 			
// 		})
		
		getLyric(playingmusicID);
		isPlay=true;
	}
	//停止事件
	$('#audio')[0].onpause=function(){
		console.log('stop');
		$('#play_state').removeClass('active');
		$('#music_playing').removeClass('active');
		// $('#my-musice').removeClass('active');
		$('#my-musice').css({
			animationPlayState:"paused"
		})
		isPlay=false;
	}
	//播放实时
	
	$('#audio')[0].ontimeupdate=function(){
		// console.log(this.currentTime);
		let x=0;
		let allTime=this.duration;
		// console.log(allTime)
		let nowTime=this.currentTime;
		let percent=nowTime/allTime;
		let MoveX=percent*($('.progressBar').width()-$('#slid').width());
		if(!progressTouch){
			$('#slid').css({
				left:MoveX+'px'
			})
			$('.slidBox').css({
				width:MoveX+'px'
			})
		}
	
			
		
		// console.log(playingLyric.length)
		for (let i=x;i<playingLyric.length;i++) {
			// console.log('llll==>',parseFloat(playingLyric[i].t));
			if((parseFloat(playingLyric[i].t)<this.currentTime+1)&&(parseFloat(playingLyric[i].t)>this.currentTime-0.5))
			{
				if(t===i){
					break;
				}
				console.log('i==>',i)
				lyricMove(i);
				x++;
				t=i;
			}
		}	
	}
	$('#audio')[0].onended=function(){
		// console.log('播放结束');
		next(ID);
	}
	//把播放的歌曲添加到历史列表
	function addHistory(obj){
		//重复判定
		var t=true;
		for (var i=0;i<historyArr.length;i++) {
			if(obj.id==historyArr[i].id){
				t=false;
			}	
		}
		if(t===false){
			return;
		}
		if(historyArr.length<8){
			historyArr.push(obj);
		}else{
			historyArr.shift();
			historyArr.push(obj);
		}
		setHistory(historyArr);
	}
	//播放历史上拉列表
	function setHistory(arr){
		$('#his_ul').empty();
		for(let i=0;i<arr.length;i++){
			var lis=$(`<li class="his_li clearfix" id='${arr[i].id}'>
								<div class="image_box fl">
									<img src="${arr[i].imgSrc}" />
								</div>
								<div class="his_about fl">
									${arr[i].name}
								</div>
								<div class="h_time fr">
									${arr[i].time}
								</div>
							</li>`)
			$('#his_ul').append(lis);
		}
	}
	$('#his_ul').on('click','.his_li',function(){
		id=$(this).attr('id');
		
		getMusic(id);
	})
	$('#list').on('click',function(){
		
		$('#history').animate({
			bottom:0+'rem'
		})
		songLiAct(playingmusicID);
	})
	//歌曲播放状态样式//给谁active呢
	function songLiAct(id){
		let songlis=$('.songLi');
		let hisLis=$('.his_li');
		// console.log("播放状态")
		// let song;
		//清除所有active
		for(let i=0;i<songlis.length;i++){
			$(songlis[i]).removeClass('active');
		}
		// console.log(songlis[1])
		for(let i=0;i<songlis.length;i++){
			if($(songlis[i]).attr('id')==id){
				// console.log('233333')
				$(songlis[i]).addClass('active');
			}
		}
		for(let i=0;i<hisLis.length;i++){
			$(hisLis[i]).removeClass('active');
		}
		for(let i=0;i<hisLis.length;i++){
			if($(hisLis[i]).attr('id')==id){
				$(hisLis[i]).addClass('active');
			}
		}
		
	}
	var pJudge=true;
	$('#discover').on('click',function(){
		if(pJudge){
			$('#p').css({
				display:'none'
			});
			pJudge=false;
			this.src="img/discover.png";
		}else{
			$('#p').css({
				display:'block'
			});
			pJudge=true;
			this.src="img/discover(2).png";
		}
	})
	$('#my-musice').on('click',function(){
		showLyric();
		
	})
	//触点
	$('#p').on('touchstart',function(){
				//标记是否移动，移动就不触发放大
				let moveTarg=false;
				let ImusicW=$('.Imusic').width();
				let ImusicH=$('.Imusic').height();
				$('#p').on('touchmove',function(e){
					// console.log(e)
					moveTarg=true;
					var touch=e.originalEvent.targetTouches[0];
					// console.log(touch);
					var x=touch.clientX-$(this).width()/2;
					var y=touch.clientY-$(this).height()/2;
					x=x>(ImusicW-$(this).width())?(ImusicW-$(this).width()):x<0?0:x;
					y=y>(ImusicH-$(this).height())?(ImusicH-$(this).height()):y<0?0:y;
					// console.log(x,y)
					$(this).css({
						left:x+'px',
						top:y+'px'
					})
				})
				function fnEnd(){
					$(this).unbind('touchmove');
					$(this).unbind('touchend');
					// console.log(this.offsetLeft+$(this).width()/2);
					let endLef=this.offsetLeft+$(this).width()/2;
					let endTop=this.offsetTop+$(this).height()/2;
					// console.log('end==>',endLef)
					// console.log(ImusicH/3)
					//贴顶或底
					
					if(endTop<ImusicH/10){
						$(this).css({
							top:0+'rem'
						})
						return;
					}else if(endTop>ImusicH/10*9){
						$(this).css({
							top:ImusicH-$(this).height()+'px'
						})
						return;
					}
					if(endLef<ImusicW/4){
						$(this).css({
							left:0+'px'
						})
					}else if(endLef>ImusicW/4*3){
						$(this).css({
							left:ImusicW-$(this).width()+'px'
						})
					}
					
					$('#p').toggleClass('active');
					$('#home-box').toggleClass('active');
					if(moveTarg===true){
						
						$('#p').removeClass('active');
						$('#home-box').removeClass('active');
					}
				}
					$(this).on('touchend',fnEnd)
			})
			
		//获取歌词
		function getLyric(id){
			$('.lyric_box').empty();
			$('.cd_title').text(title);
			let data=localStorage.getItem('lyric'+id);
			data=JSON.parse(data);
			if(!data){
				$.ajax({
					type:'GET',
					url:'http://www.arthurdon.top:3000/lyric?id='+id,
					success:function(data){
						localStorage.setItem('lyric'+id,JSON.stringify(data));
						setLyric(data);
					}
				})
			}else{
				// console.log('lyric'+id,	data);
				setLyric(data);
			}
		}
		//设置歌词
		function setLyric(data){
			movelyricMoveArr=[];
			let lrc=data.lrc.lyric;
			let reg=/\[\d*:\d*\.\d*\]/g;
			// console.log(lrc)
			let time=lrc.match(reg);
			let lrcNotime=lrc.split(reg);
			lrcNotime.splice(0,1);
			let arr=[];
			let pat=/[\.||:]/g;
			let pat2=/[\[||\]]/g;
			for(let i=0;i<time.length;i++){	
				time[i]=time[i].replace(pat2,"");
				let tim=time[i].split(pat);
				let str=parseInt(tim[0]*60)+parseInt(tim[1])+'.'+tim[2];
				arr.push({
					t:str,
					l:lrcNotime[i]
				})
			}
			// console.log('arr==',arr)
			
			playingLyric=arr;
			// console.log(lrcNotime);
			// console.log(time);
			for(let i=0;i<lrcNotime.length;i++){
				let p=`<p class="lyp">${arr[i].l}</p>`;
				$('.lyric_box').append(p);
			}
			for(let i=0;i<$('.lyp').length;i++){
				// console.log($($('.lyp')[i]).height());
				movelyricMoveArr.push($($('.lyp')[i]).outerHeight(true)+$('.lyp')[i].offsetHeight);
			}
			// console.log('aaaaaaaaaaaaaa',movelyricMoveArr);
			
		}
		let y=1;
		//歌词运动
		function lyricMove(i){
			let halfBox=$('.lyric_box').height()/2;
			$('.lyp').removeClass('lp3');
			$($('.lyp')[i]).addClass('lp3');
			// let arr=[];
			let lyp_top=0;
			let y=0;
			
			// console.log($('.lyp'))
			
				//拿到该歌词前面所有子节点的高度
			// console.log('11111111',$('.lyric_box').height(),$('.lyricL2')[0].scrollHeight)
			let to=0;
			if($('.lyp')[i]===undefined){
				return;
			}
			lyp_top=$('.lyp')[i].offsetTop;
			console.log('are you ready?')
			//没有在点击时才能轮播
			if(!touchJudge){
				console.log('ready')
				to=lyp_top-$('.lyric_box').height()/2;
				
				var boxElement=document.getElementById('lyric_box');
				// console.log(boxElement)
				if(to<boxElement.scrollHeight){
					// console.log('to==>',to);
					
					console.log('to',to,'now',boxElement.scrollTop);
					// boxElement.scrollTop=to;
					
					// console.log(boxElement.scrollHeight);
					let maxScroll=boxElement.scrollHeight-boxElement.offsetHeight;
					let now=boxElement.scrollTop;
					let allmove=boxElement.scrollTop;
					let move=(to-now)/10;
					let clear=setInterval(function(){
						
// 						if(move<=0){
// 							console.log('1清除')
// 							clearInterval(clear);
// 						}
						
						boxElement.scrollTop=allmove+move;
						allmove+=move;
						if(boxElement.scrollTop===to||boxElement.scrollTop===0||boxElement.scrollTop===maxScroll){
							console.log('清除')
							clearInterval(clear);
						}
					},50)
					// scrollAni(to);
				}else{
					// console.log('到底');
					boxElement.scrollTop=boxElement.scrollHeight-boxElement.clientHeight;
				}	
			}	
		}
		function scrollAni(x){
			
// 			let moveTo=Math.floor(document.getElementById('lyric_box').scrollTop);
// 			
// 			let clea=setInterval(function(){
// 				// let nowScroll=document.getElementById('lyric_box').scrollTop;
// 				// console.log(nowScroll);
// 				let moveLen=Math.floor((x-moveTo)/10);
// 				
// 				moveTo=moveLen+moveTo;
// 				moveTo=moveTo>0?Math.floor(moveTo):Math.ceil(moveTo);
// 				document.getElementById('lyric_box').scrollTop=moveTo;
// 				if(document.getElementById('lyric_box').scrollTop==x){
// 					// console.log('清除定时器');
// 					clearInterval(clea);
// 				}
// 			},50);
			
			let nowTarg=document.getElementById('lyric_box').scrollTop;
			let clea=setInterval(function(){
				
				let movelen=Math.floor((x-nowTarg)/10);
				movelen=movelen>0?Math.floor(movelen):Math.ceil(movelen);
				// console.log(movelen);
				document.getElementById('lyric_box').scrollTop=movelen;
				// nowTarg=nowTarg+movelen;
				if(nowTarg===x){
					clearInterval(clea);
				}
			},50)
		}
		$(document).on('touchstart',function(){
			touchJudge=true;
			$(document).on('touchend',function(){
				touchJudge=false;
			})
		})
		//test
		//滚动延迟2s激活轮播歌词....这是滚动啊啊啊啊啊啊。。。
		let lyricScroll=[];
// 		$('.lyric_box').on('scroll',function(){
// 			let timer=setTimeout(function(){
// 				for(let i=1;i<lyricScroll.length;i++){
// 					clearTimeout(lyricScroll[i]);
// 				}
// 				touchJudge=false;
// 			},2000)
// 			lyricScroll.push(timer);
// 			touchJudge=true;
// 		})
		
		$('.lyric_box').on('touchstart',function(){
			console.log('点击')
			touchJudge=true;
			$('.lyric_box').on('touchend',function(){
				console.log('放')
				let timer=setTimeout(function(){
					for(let i=1;i<lyricScroll.length;i++){
						clearTimeout(lyricScroll[i]);
					}
					touchJudge=false;
				},3000)
				lyricScroll.push(timer);
			})
		})
		// console.log(playingLyric);
		// lyricMove(20)
		
		$('#main_pagebtn').on('click',function(){
			showLyric();
		})
		function showLyric(){
			songStart=0;
			$('#list_ul').empty();
			$('#music_list').css({
				display:'none'
			})
			$('.index-box').css({
				display:"none"
			})
			$('.footer').css({
				display:"none"
			})
			$('.main_page').css({
				display:"block"
			})
		}
		$(document).on('click','.playBtn',function(){
			if(isPlay){
				isPlay=false;
				$('#audio')[0].pause();
				$('#PlayButton').css({
					display:'none'
				})
				$('#pauseBtn').css({
					display:'block'
				})
			}else{
				$('#PlayButton').css({
					display:'block'
				})
				$('#pauseBtn').css({
					display:'none'
				})
				isPlay=true;
				$('#audio')[0].play();
			}
		})
		$(document).on('click','#backBtn',function(){
			toHome();	
		})
		
		function toHome(){
			$('.index').css({
				display:"block"
			})
			$('.footer').css({
				display:"block"
			})
			$('.main_page').css({
				display:"none"
			})
			$('.index-box').css({
				display:"block"
			})
			//
			songStart=0;
			$('#list_ul').empty();
			$('#index').css({
				display:'block'
			})
			$('#music_list').css({
				display:'none'
			})
			songLiAct(playingmusicID);
		}
		
		//这里需要拿到歌单id
		function next(id){
			//播放歌单初始化
			PlaingSongList=[];
			playingmusicID=playingmusicID;
			let dataInfo;
			var songListInfo=localStorage.getItem('songListInfo'+id);
			let priIds=[];
			var hisOne={};
			//下标
			let x;
			// 			var hisOne={};
			// 			hisOne.imgSrc=this.children[0].children[0].src;
			// 			hisOne.name=this.children[1].children[0].innerText;
			// 			hisOne.time=this.children[2].innerText;
			// 			hisOne.id=id;
			if(!songListInfo){
				$.ajax({
					type:'GET',
					url:'http://www.arthurdon.top:3000/playlist/detail?id='+id,
					success:function(data){
						// console.log('SongList==>',data);
					
						dataInfo=data;
						let priIds=[];
						for(let i=0;i<data.privileges.length;i++){
							priIds.push(data.privileges[i].id);
						}
						PlaingSongList=priIds;
						let nextSongId;
						for(let i=0;i<priIds.length;i++){
							if(priIds[i]===playingmusicID){
								nextSongId=priIds[i+1];
								x=i+1;
							}
						}
					}
				})
			}
			if(songListInfo){
				//arr是拿到的json数据
				var arr=JSON.parse(songListInfo);
				// console.log('arr==>',arr)
				// $('#lis_sp').text(arr.playlist.name);
				//直接拿privileges的id吧
				
				for(let i=0;i<arr.privileges.length;i++){
					priIds.push(arr.privileges[i].id);
				}
				PlaingSongList=priIds;
				// showData(arr.slice(songStart,songStart+ songAdd));
				// songStart+=songAdd;
				dataInfo=arr;
			}
			////
			let nextSongId;
			// console.log('dataInfo==>',dataInfo);
			
				
			console.log('playingmusicID==>',playingmusicID);
			for(let i=0;i<priIds.length;i++){
				if(priIds[i]==playingmusicID){
					nextSongId=priIds[i+1];
					x=i+1;
					title=dataInfo.playlist.tracks[i].name;
				}
			}
			hisOne.imgSrc=dataInfo.playlist.tracks[x].al.picUrl;
			hisOne.name=dataInfo.playlist.tracks[x].name;
			hisOne.time=ReTime(dataInfo.playlist.tracks[x].dt);
			hisOne.id=dataInfo.playlist.tracks[x].id;
			// console.log('priIds==>',priIds);
			// console.log('nextSongId==>',nextSongId);
			playingmusicID=nextSongId;
			//播放
			getMusic(nextSongId);
			//重设播放状态
			songLiAct(nextSongId);
			title=hisOne.name;
			getLyric(nextSongId);
			addHistory(hisOne);
		}
		//直接拿next改个for循环就行了=.=
		function prev(id){
			//播放歌单初始化
			PlaingSongList=[];
			playingmusicID=playingmusicID;
			let dataInfo;
			var songListInfo=localStorage.getItem('songListInfo'+id);
			let priIds=[];
			var hisOne={};
			//下标
			let x;
			// 			var hisOne={};
			// 			hisOne.imgSrc=this.children[0].children[0].src;
			// 			hisOne.name=this.children[1].children[0].innerText;
			// 			hisOne.time=this.children[2].innerText;
			// 			hisOne.id=id;
			if(!songListInfo){
				$.ajax({
					type:'GET',
					url:'http://www.arthurdon.top:3000/playlist/detail?id='+id,
					success:function(data){
						// console.log('SongList==>',data);
					
						dataInfo=data;
						let priIds=[];
						for(let i=0;i<data.privileges.length;i++){
							priIds.push(data.privileges[i].id);
						}
						PlaingSongList=priIds;
						let nextSongId;
						for(let i=0;i<priIds.length;i++){
							if(priIds[i]===playingmusicID){
								nextSongId=priIds[i-1];
								x=i-1;
								if(!nextSongId){
									return;
								}
							}
						}
					}
				})
			}
			if(songListInfo){
				//arr是拿到的json数据
				var arr=JSON.parse(songListInfo);
				// console.log('arr==>',arr)
				// $('#lis_sp').text(arr.playlist.name);
				//直接拿privileges的id吧
				
				for(let i=0;i<arr.privileges.length;i++){
					priIds.push(arr.privileges[i].id);
				}
				PlaingSongList=priIds;
				// showData(arr.slice(songStart,songStart+ songAdd));
				// songStart+=songAdd;
				dataInfo=arr;
			}
			////
			let nextSongId;
			// console.log('dataInfo==>',dataInfo);
			
				
			// console.log('playingmusicID==>',playingmusicID);
			for(let i=0;i<priIds.length;i++){
				if(priIds[i]==playingmusicID){
					nextSongId=priIds[i-1];
					if(!nextSongId){
						return;
					}
					x=i-1;
					title=dataInfo.playlist.tracks[i].name;
				}
			}
			hisOne.imgSrc=dataInfo.playlist.tracks[x].al.picUrl;
			hisOne.name=dataInfo.playlist.tracks[x].name;
			hisOne.time=ReTime(dataInfo.playlist.tracks[x].dt);
			hisOne.id=dataInfo.playlist.tracks[x].id;
			// console.log('priIds==>',priIds);
			// console.log('nextSongId==>',nextSongId);
			playingmusicID=nextSongId;
			//播放
			getMusic(nextSongId);
			//重设播放状态
			songLiAct(nextSongId);
			title=hisOne.name;
			getLyric(nextSongId);
			addHistory(hisOne);
		}
		function loop(id){
						PlaingSongList=[];
			playingmusicID=playingmusicID;
			let dataInfo;
			var songListInfo=localStorage.getItem('songListInfo'+id);
			let priIds=[];
			var hisOne={};
			//下标
			let x;
			// 			var hisOne={};
			// 			hisOne.imgSrc=this.children[0].children[0].src;
			// 			hisOne.name=this.children[1].children[0].innerText;
			// 			hisOne.time=this.children[2].innerText;
			// 			hisOne.id=id;
			if(!songListInfo){
				$.ajax({
					type:'GET',
					url:'http://www.arthurdon.top:3000/playlist/detail?id='+id,
					success:function(data){
						// console.log('SongList==>',data);
					
						dataInfo=data;
						let priIds=[];
						//记录歌单中歌曲的id
						for(let i=0;i<data.privileges.length;i++){
							priIds.push(data.privileges[i].id);
						}
						PlaingSongList=priIds;
						let nextSongId;
// 						for(let i=0;i<priIds.length;i++){
// 							if(priIds[i]===playingmusicID){
// 								nextSongId=priIds[i+1];
// 								x=i+1;
// 							}
// 						}
						let i=parseInt(Math.random()*priIds.length);
						nextSongId=priIds[i];
						x=i;
					}
				})
			}
			if(songListInfo){
				//arr是拿到的json数据
				var arr=JSON.parse(songListInfo);
				// console.log('arr==>',arr)
				// $('#lis_sp').text(arr.playlist.name);
				//直接拿privileges的id吧
				
				for(let i=0;i<arr.privileges.length;i++){
					priIds.push(arr.privileges[i].id);
				}
				PlaingSongList=priIds;
				// showData(arr.slice(songStart,songStart+ songAdd));
				// songStart+=songAdd;
				dataInfo=arr;
			}
			////
			let nextSongId;
			// console.log('dataInfo==>',dataInfo);
			
				
			// console.log('playingmusicID==>',playingmusicID);
// 			for(let i=0;i<priIds.length;i++){
// 				if(priIds[i]==playingmusicID){
// 					nextSongId=priIds[i+1];
// 					x=i+1;
// 					title=dataInfo.playlist.tracks[i].name;
// 				}
// 			}
			let i=parseInt(Math.random()*priIds.length);
			console.log(i)
			nextSongId=priIds[i];
			x=i;
			title=dataInfo.playlist.tracks[i].name;
			
			hisOne.imgSrc=dataInfo.playlist.tracks[x].al.picUrl;
			hisOne.name=dataInfo.playlist.tracks[x].name;
			hisOne.time=ReTime(dataInfo.playlist.tracks[x].dt);
			hisOne.id=dataInfo.playlist.tracks[x].id;
			// console.log('priIds==>',priIds);
			// console.log('nextSongId==>',nextSongId);
			// console.log('hisOne==>',hisOne);
			playingmusicID=nextSongId;
			//播放
			getMusic(nextSongId);
			//重设播放状态
			
			title=hisOne.name;
			getLyric(nextSongId);
			addHistory(hisOne);
			songLiAct(nextSongId);
		}
		$(document).on('click','#right-square',function(){
			if(!random){
				next(ID);
			}else{
				loop(ID);
			}
		})
		$(document).on('click','#left-square',function(){
			if(!random){
				prev(ID);
			}else{
				loop(ID);
			}
			
		})
		$('#slid').on('touchstart',function(){
			progressTouch=true;
			let ToTime;
			$('#slid').on('touchmove',function(e){
				var touch=e.originalEvent.targetTouches[0];
				var x=touch.clientX;
				let max=$('.progressBar').width()-$(this).width();
				x=x<0?0:x>max?max:x;
				let percent=x/max;
				ToTime=percent*$('#audio')[0].duration;
				$(this).css({
					left:x+'px'
				})
				$('.slidBox').css({
					width:x+'px'
				})
			})
			$('#slid').on('touchend',function(){
				$('#audio')[0].currentTime=ToTime;
				progressTouch=false;
				
			})
		})
		var shlop=true;
		$('.palymode').on('click',function(){
			
			if(shlop){
				$('#lop').css({
					display:"none"
				});
				$('#shuffle').css({
					display:'block'
				})
				shlop=false;
				random=true;
			}else{
				$('#lop').css({
					display:"block"
				});
				$('#shuffle').css({
					display:'none'
				})
				shlop=true;
				random=false;
			}
		})
// 		$('#Imusic').on('touchend',function(){
// 			if(!$('#home-box').hasClass('active')){
// 				$('#p').removeClass('active');
// 				$('#home-box').removeClass('active');
// 			}
// 		})
})