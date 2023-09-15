define(function (require, exports, module) {
	var uibase = require("uibase");
	require("jquery");
	require("uidialog");
	require("./jsplumb.js");
	require("./d3.v3.js");
	require("./dagre-d3.js");
	require("./table.js");
	require("./html2canvas.js");
	require("sjzl/youjian/jquery.contextmenu.js");

    exports.init = function (opts, dllparams) {

   
	var sid = getQueryVariable("sid");
    var id = getQueryVariable("id");
    window.parent['initAction']["id"+id]();
    var table =null;
    /*获取URL参数*/
    function getQueryVariable(variable)
    {
           var query = window.location.search.substring(1);
           var vars = query.split("&");
           for (var i=0;i<vars.length;i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == variable){
                	   return pair[1];}
           }
           return "";
    }
    var url ="";
    if(getQueryVariable("entity") || getQueryVariable("model")){
    	url = ctx+'/consanguinityView/consanguinityData.vot?'+
			'sid='+getQueryVariable("sid")+
			'&entity='+ getQueryVariable("entity") +
			'&is_min='+ getQueryVariable("is_min") +
			'&model='+ getQueryVariable("model") +
			'&system='+ getQueryVariable("system") +
			'&flag='+ getQueryVariable("flag")+
			'&is_confirm='+ getQueryVariable("is_confirm")+
			'&schema='+ getQueryVariable("schema");
    	$(".save").css("display","none");
    	$.post(url,function(data){
        	setData(data.data);
        },'json');
    }else if(getQueryVariable("data")){
	    var data = window.parent['analysisDataOnTimedata'];
	    setData(data);
	   	 $(".save").css("display","none");
    }else if(getQueryVariable("sid")){
    	url = ctx+'/consanguinityView/consanguinityData.vot?'+
		'sid='+getQueryVariable("sid")+
		'&entity='+ getQueryVariable("entity") +
		'&is_min='+ getQueryVariable("is_min") +
		'&system='+ getQueryVariable("system") +
		'&system='+ getQueryVariable("system") +
		'&is_confirm='+ getQueryVariable("is_confirm")+
		'&view_name='+ getQueryVariable("view_name");
    	if(getQueryVariable("viewOrEdit")=="view"){
    		$(".save").css("display","none");
    	}
    	$.post(url,function(data){
        	setData(data.data);
        },'json');
    }

    function groupLoadComplete(){
    	var width =200,height =112;
    	html2canvas($("#uml")[0], {
			  onrendered: function(canvas) {
			    var url = canvas.toDataURL('image/jpeg');
			    $("#smmap canvas").remove();
			    $("#smmap")[0].appendChild(canvas);
			    $("#smmap canvas").css("height",height);
			    $("#smmap canvas").css("width",width);
			  },
			  width: document.body.scrollWidth,
			  height: document.body.scrollHeight
			});
    	if(!$("#canvas").attr("changeWH")){
    		$("#canvas").css("height",document.body.scrollHeight+"px");
        	$("#canvas").css("width",document.body.scrollWidth+"px");
        	$("#canvas").attr("changeWH",true);
    	}
    	
    	
    }
    
    function relateChanged(tableResult,item){
    	var html ='<table id="exportResultTable"><tr><th>序号</th><th>实体</th></tr>';
    	$(tableResult).each(function(index,result){
    		html += '<tr><td>'+index+'</td>';
    		$(result).each(function(index2,item2){
    			if(item == item2){
    				html+="<td><span  class='blod'>"+item2+"</span></td>";
    			}else{
    				html+="<td>"+item2+"</td>";
    			}
    		})
    		html += '</tr>';
    	})
    	html += '</table>';
    	$("#relate  .relateContent",$(parent.document).find(".allContent[sid='"+id+"']")).html(html);
    }
    function selectedItem(item,coordinates){
    		function insertStr(soure, start,end){
    			if(soure.slice(start-1, end-1).length <=0){
    				return soure;
    			}
    		   return soure.slice(0, start-1)+"@1" +soure.slice(start-1, end-1) +"@2" + soure.slice(end-1);
    		}
	    	if(!item){
	    		return;
	    	}
    		var  text = $("#sql pre",$(parent.document).find(".allContent[sid='"+id+"']")[0]).data("sql");
    		var newText ="";
    		var indexB = 1;
    		if(new RegExp("^\r\n.*$").test(text)){
    			newText="1:\r\n";
    			indexB = 2;
    		}
    		if(text){
    			var ar = text.split("\n");
    			$(ar).each(function(index,item0){
        			item0 =item0.replace(/[\r\n]/g,"");
        			$(coordinates).each(function(index2,item2){
        				if(item){
        					if(parseInt(index+indexB) == item2.x_begin){
        	    				item0 = insertStr(item0,parseInt(item2.y_begin),parseInt(item2.y_end));
        	    			} 
            			}
        			})
    				item0 = replace(item0);
        			newText+= parseInt(index+indexB)+":	"+ item0+"\n";
        		})
    		}
        	$("#sql pre",$(parent.document).find(".allContent[sid='"+id+"']")[0]).html(newText);
    		scroll();
    		
    		function replace(str){
    			 str = 
    				 str.replace(/'/g, '&apos;')
    				 	.replace(/"/g, '&quot;')
    				 	.replace(/</g, '&lt;')
    				 	.replace(/>/g, '&gt;')
    				 	.replace(/@1/g, '<span>')
    				 	.replace(/@2/g, '</span>');
    			 return str;
    		}
    		
    		
    }
    //滚动到视野
    function scroll(){
    	if($('#sql pre span',$(parent.document).find(".allContent[sid='"+id+"']")[0]).length>0){
    		$('#sql pre',$(parent.document).find(".allContent[sid='"+id+"']")[0]).scrollTop(0);
			$('#sql pre',$(parent.document).find(".allContent[sid='"+id+"']")[0]).animate({
   		     scrollTop:$('#sql pre span',$(parent.document).find(".allContent[sid='"+id+"']")[0]).eq(0).offset().top -$(window).height()/2,
   		     scrollLeft:$('#sql pre span',$(parent.document).find(".allContent[sid='"+id+"']")[0]).eq(0).offset().left-$(window).width()/2
			},200);
    	}
    }
    function smmap(){
    	var width =200,height =112;
    	var px = $("#uml").outerHeight(true)/height;
    	var py = $("#uml").outerWidth(true)/width;
    	var mvdivx = document.body.clientHeight*height/document.body.scrollHeight;
    	var mvdivy = document.body.clientWidth*width/document.body.scrollWidth;
    	
    	$("#mvdiv").css("height",mvdivx+"px");
    	$("#mvdiv").css("width",mvdivy+"px");
    	$("#smmap").css("height",(height+mvdivx/8)+"px");
    	$("#smmap").css("width",(width+mvdivy/8)+"px");
    	
    	$('#mvdiv').mousedown(function(e) {
    		var xx=e.pageX-$(this).offset().left;
    		var yy=e.pageY-$(this).offset().top;
    		$("#smmap").mousemove(function(e) {
    			var positionDiv = $(this).offset();
		        var distenceX = e.pageX - positionDiv.left;
		        var distenceY = e.pageY - positionDiv.top;
    			
	            var x = distenceX-xx;
	            var y = distenceY-yy;
	            if (x < 0) {
	                x = 0;
	            } else if (x > $("#smmap").width() - $('#mvdiv').outerWidth(true)) {
	                x = $("#smmap").width() - $('#mvdiv').outerWidth(true);
	            }
	
	            if (y < 0) {
	                y = 0;
	            } else if (y > $("#smmap").height() - $('#mvdiv').outerHeight(true)) {
	                y = $("#smmap").height() - $('#mvdiv').outerHeight(true);
	            }
	
	            $('#mvdiv').css({
	                'left': x + 'px',
	                'top': y + 'px'
	            });
	            
	            window.scrollTo(document.body.scrollWidth*x/width,document.body.scrollHeight*y/height);
    		});

        $("#smmap").mouseup(function() {
            $("#smmap").off('mousemove');
        });
        $("#smmap").mouseleave(function() {
            $("#smmap").off('mousemove');
        });
        
       
    });
	$(document).scroll(function() {
	    var scroH = $(document).scrollTop();  //滚动高度
	    var scroW = $(document).scrollLeft();  //滚动高度
	    var viewH = $(window).height();  //可见高度
	    var contentH = $(document).height();  //内容高度
	 
	    if(scroH >100){  //距离顶部大于100px时
	 
	    }
	    if (contentH - (scroH + viewH) <= 100){  //距离底部高度小于100px
	          
	    } 
	    if (contentH = (scroH + viewH)){  //滚动条滑到底部啦
	    	var hh = scroH*(height)/ document.body.scrollHeight;
	    	var ww = scroW*(width)/ document.body.scrollWidth;
	    	$('#mvdiv').css({
                'left': ww + 'px',
                'top': (hh) + 'px'
            });
	    } 
	 
	});
	
    }
    
    function setData(data){

    	if(!data){
    		return;
    	}
   	  table = new Table({
   		 containerId: 'canvas',
   		 initTableData:data.tableData,
   		 initConnectionData:data.tableConnections,
   		 coordinatesData:data.coordinates,
   		 sid:sid,
   		 groupLoadComplete:function(){
   			 groupLoadComplete();
   		 },
   		 drowEnd:function(){
  			 groupLoadComplete();
  		 },
   		 viewChanged:function(){
   			 groupLoadComplete();
   		 },
   		 relateChanged:function(tableResult,item){
   			 relateChanged(tableResult,item);
   		 },
   		 selectedItem:function(item,coordinates){
   			 selectedItem(item,coordinates);
   		 },sqlflowgraph:function(callback){
   			sqlflowgraph(callback);
   		 }
   		});
   	 
   	function sqlflowgraph(callback){
  		 $.post(ctx+'/dataSqlFlowGraphController/sqlflowGraph.vot',{tableConnections:JSON.stringify(table.getConnections()),tableDatas:JSON.stringify(table.getGroups())},function(data){
  			callback(data);
  		 },'json');
  	 }
   	 
   	 $("#sql pre",$(parent.document).find(".allContent[sid='"+id+"']")[0]).data("sql",data.processed_sql);
   	 $("#sql pre",$(parent.document).find(".allContent[sid='"+id+"']")[0]).text(data.processed_sql);
   	 selectedItem("null",[]);
   	 
   	 var modelHtml = "<table id='modelTable'><tr><th>表</th><th>字段</th></tr>";
   	 var nodes = [];
   	 $(data.tableData).each(function(tableIndex,tableItem){
   		 try {
   			modelHtml += "<tr ><td rowspan="+tableItem.tableCell.length+">"+tableItem.entity+"</td>";
   	   		var node = {
   	   				name: tableItem.entity+(tableItem.entity_chinese_name?"("+tableItem.entity_chinese_name+")":""),
   	   				sid:tableItem.sid,
   	   				open: true,
   	   				children: []
   	   		};
   	   		
   	   		 $(tableItem.tableCell).each(function(cellIndex,cellItem){
   	   			
   	   			 if(cellIndex == 0){
   	   				modelHtml+= "<td >"+cellItem.model+"</td></tr>" ;
   	   			 }else{
   	   				modelHtml+= "<tr><td style='display:none;'><td>"+cellItem.model+"</td></tr>" ;
   	   			 }
   	   			node.children.push({
   	   				name: cellItem.model+(cellItem.model_chinese_name?"("+cellItem.model_chinese_name+")":""),
   	   				sid :cellItem.sid
   	   			});
   	   		 })
   	   		nodes.push(node);
		} catch (e) {
			// TODO: handle exception
		}
   		
   	 })
   	 modelHtml+="</table>"
   	 
   	$("#model .modelContent",$(parent.document).find(".allContent[sid='"+id+"']")[0]).html(modelHtml);
   	
   	 parent.$(".dialogtemplate .btn-primary").css("display","none");
   	 $(".save").click(function(){
   		 $.post(ctx+'/consanguinityView/saveTableRelate.vot',{sid:sid,connections:JSON.stringify(table.getConnections()),groups:JSON.stringify(table.getGroups()),is_min:getQueryVariable("is_min")},function(data){
   			 if(data.success){
   				window.location.reload();
   				 parent.window["uialert"]("保存成功","success");
   			 }else{
   				 parent.window["uialert"]("保存失败","warning");
   			 }
   		 },'json')
   	 })
   	 smmap();
   	 parent.window["zTree"][getQueryVariable("id")](JSON.stringify(nodes));
    }
    }
    
    exports.defaultFullScreen = function() {
    	return true;
    }
});
