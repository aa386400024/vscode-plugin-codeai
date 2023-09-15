;(function(undefined) {
    var _global;
    var _grlbalTransform = 1;
    function extend(o,n,override) {
        for(var key in n){
            if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)){
                o[key]=n[key];
            }
        }
        return o;
    };
    HTMLElement.prototype.appendHTML = function(html) {
        var divTemp = document.createElement("div"),
	        nodes = null, 
	        fragment = document.createDocumentFragment();
        divTemp.innerHTML = html;
        nodes = divTemp.childNodes;
        for (var i=0, length=nodes.length; i<length; i+=1) {
           fragment.appendChild(nodes[i].cloneNode(true));
        }
        this.appendChild(fragment);
        nodes = null;
        fragment = null;
    };
    function Table(opt){
        this._initial(opt);
    }
    Table.prototype = {
        constructor: this,
        _initial: function(opt) {
            var def = {
            	containerId: null,
            	sid:null, 
                initTableData:[],
                initConnectionData:[],
                showChange:false,
                coordinatesData:[],
                tableWidth:400,
                instance:null,
                groupLoadComplete:$.noop,
                viewChanged:$.noop,
                relateChanged:$.noop,
                selectedItem:$.noop,
                drowEnd:$.noop,
                sqlflowgraph:$.noop
            };
       	 	this.def = extend(def,opt,true); 
       	 	var superThis = this;
            jsPlumb.ready(function () {
            	superThis.def.instance = 
            		jsPlumb.getInstance({
            		Container:canvas,
            		EndpointStyle: { fill: "#ffa500" },
            		ListStyle:{
                        endpoint:[ "Rectangle", { width:30, height:30 }]
                    },
                	ConnectionOverlays: [ 
                	            ["Arrow", {  
                	                location:1,
                	                visible: true,
                	                width: 8,
                	                length: 10,
                	                foldback:1,
                	                id: "ARROW",
                	                events: {
                	                    click: function () {
                	                    }
                	                }
                	            }]],
            		Endpoint:["Dot", {radius:5}],
            		overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "Drag",
                            cssClass: "endpointSourceLabel",
                            visible:true
                        } ]
                    ]
        			});
            	debugger;
            	superThis._registerConnection();
            	//superThis._setAllTablePosition("dagre");
            	superThis._initTable();
            	superThis._initGroup();
            	superThis._initConnections();
             	superThis._addAction();
            })
           
        },
        _registerConnection:function(){
        	let superThis = this;
        	// 连线样式  灰色实线
        	let setting = {
    			    paintStyle: {stroke: '#ababab', strokeWidth: 1},
    			    connectorStyle: {stroke: '#ababab', strokeWidth: 1},
    			    connectorHoverStyle: {stroke: '#ababab', strokeWidth: 1 },
    			    hoverPaintStyle: { stroke: '#ababab', strokeWidth: 1 }
    		 };
        	superThis.def.instance.registerConnectionType('base', setting);
        	
        	// 连线样式 黑色实线
        	let setting2 = {
    			    paintStyle: {stroke: '#000000', strokeWidth: 1 },
    			    connectorStyle: {stroke: '#000000', strokeWidth: 1},
    			    connectorHoverStyle: {stroke: '#000000', strokeWidth: 1 },
    			    hoverPaintStyle: { stroke: '#000000', strokeWidth: 1 }
    		 };
        	superThis.def.instance.registerConnectionType('relate', setting2);
        	
        	// 连线样式 黑色虚线
        	let setting3 = {
    			    paintStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4" },
    			    connectorStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4"},
    			    connectorHoverStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4" },
    			    hoverPaintStyle: { stroke: '#000000', strokeWidth: 1 ,"dashstyle": "2 4"}
    		 };
        	superThis.def.instance.registerConnectionType('dash_base', setting3);
        	
        	// 连线样式 灰色虚线
        	let setting4 = {
    			    paintStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "4 2" },
    			    connectorStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "4 2"},
    			    connectorHoverStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "4 2" },
    			    hoverPaintStyle: { stroke: '#ababab', strokeWidth: 1 ,"dashstyle": "4 2"}
    		 };
        	superThis.def.instance.registerConnectionType('dash_showrelate', setting4);
        	// 连线样式  删除 红色虚线
        	let setting5 = {
    			    paintStyle: {stroke: '#ff0000', strokeWidth: 1,"dashstyle": "4 2" },
    			    connectorStyle: {stroke: '#ff0000', strokeWidth: 1,"dashstyle": "4 2"},
    			    connectorHoverStyle: {stroke: '#ff0000', strokeWidth: 1,"dashstyle": "4 2" },
    			    hoverPaintStyle: { stroke: '#ff0000', strokeWidth: 1 ,"dashstyle": "4 2"}
    		 };
        	
        	superThis.def.instance.registerConnectionType('del', setting5);
        	
        	// 连线样式  新增 绿色实线
        	let setting6 = {
    			    paintStyle: {stroke: 'green', strokeWidth: 1},
    			    connectorStyle: {stroke: 'green', strokeWidth: 1},
    			    connectorHoverStyle: {stroke: 'green', strokeWidth: 1 },
    			    hoverPaintStyle: { stroke: 'green', strokeWidth: 1 }
    		 };
        	
        	superThis.def.instance.registerConnectionType('add', setting6);
        },
        _createTable:function (data){
        	
        },
        _getCoordinates:function (id){
        	let superThis = this;
        	var coordinates = [];
        	$(superThis.def.coordinatesData).each(function(index,item){
        		if(item.uusid == id){
        			coordinates.push(item);
        		}
        	})
        	
        	return coordinates;
        },
        _reDraw:function (key){
        	var superThis = this;
        	$("#"+superThis.def.containerId).empty();
        	$("#"+superThis.def.containerId).parent().css("transform","scale(1)");
        	$("#svg-canvas").css("transform","scale(1)");
    		superThis.def.instance.removeAllGroups();
        	superThis.def.instance.deleteEveryConnection();
        	superThis.def.instance.deleteEveryEndpoint();
        	superThis.def.instance.reset();
    		superThis._initTable();
        	superThis._initGroup();
        	superThis._initConnections();
         	superThis._addAction();
         	$(".colorSchema").removeClass("selected");
        },
        _setPosition:function(key){
        	var superThis = this;
        	superThis._setAllTablePosition(key,function(tableData){
        		$(tableData).each(function(index,item){
        			var group = $("#"+superThis.def.containerId).find("#"+item.entity_sid);
        			group.css("top",superThis._getPosition(item).top);
        			group.css("left",superThis._getPosition(item).left);
        		})
             	 superThis.def.instance.repaintEverything();
        		superThis.def.viewChanged();
        	});
        	
        },
        _setAllTablePosition:function(key,callback){
        	
        	switch (key) {
			case "sortByLayer":
				sortByLayer(this,callback);
				break;
			case "dagre":
				dagre(this,callback);
				break;
//			case "tree":
//				tree(this,callback);
//				break;
			case "sqlflow":
				sqlflow(this,callback);
				break;
			default:
				dagre(this,callback);
				break;
			};
        	
			function byteLength (str) {
    		    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    		    ///<param name="str">要获得长度的字符串</param>
    		    var realLength = 0, len = str.length, charCode = -1;
    		    for (var i = 0; i < len; i++) {
    		        charCode = str.charCodeAt(i);
    		        if (charCode >= 0 && charCode <= 128) 
    		              realLength += 1;
    		        else
    		              realLength += 2;
    		    }
    		    return realLength;
    		};
        	
        	
    		function getHW(tableItem){

    			if(tableItem.tableCell){
    				var maxLength = byteLength(tableItem.name+tableItem.chinese_name);
        			var width = 200;
        			var cellHeght = 18;
        			var titleHeight =45;
        			$(tableItem.tableCell).each(function(a,b){
        				var length = byteLength(b.name+b.chinese_name);
        				maxLength = maxLength>length?maxLength:length;
        				width = maxLength*10>width?maxLength*10:width;
        			})
        			return {
	        				height:(tableItem.tableCell.length*cellHeght+titleHeight),
	    					width:width
    					};
    			}else{
    				return {height:35,width:100};
    			}
    			
    		
    		}
    		
        	function dagre(superThis,callback){
        		
        		// Create the input graph
      		  var g = new dagreD3.graphlib.Graph()
      		    .setGraph({
      		    	rankdir:'LR',//TB, BT, LR, 或者 RL 可选，默认是'TB'（从上到下）。这里T = top, B = bottom, L = left, and R = right
      		    	align:'UL',//UL（上左）, UR（上右）, DL（下左）, 或者 DR（下右），默认是 undefined 。这里U = up, D = down, L = left, and R = right。
      		    	nodesep:-10,
      		    	ranksep:1,
      		    	edgesep:1,
      		    	marginx:20,
      		    	marginy:20
      		    }).setDefaultEdgeLabel(function() { return {}; });
      		  
        		$(superThis.getGroups()).each(function(index,item){
        			var WH = getHW(item);
        			g.setNode(item.entity_sid, {
        			      id: item.entity_sid,
        			      class: "type-no",
        			      label: item.name,
        			      height:WH.height,
        			      width:WH.width+300
        			    });
        		});
        		$(superThis.getConnections()).each(function(index,item){
        			g.setEdge(item.source_entity_sid,item.target_entity_sid,{});
        		});	
        		
        		  
        		  // Create the renderer
        		  var render = new dagreD3.render();

        		  // Set up an SVG group so that we can translate the final graph.
        		  var svg = d3.select("svg"),
        		    svgGroup = svg.append("g");

        		  // Run the renderer. This is what draws the final graph.
        		  render(d3.select("svg g"), g);
        		 
        		  var groups = [];
        		  for (var node in g._nodes) {
        			  let tableData = superThis._getGroup(node);
        			  if(tableData){
        				  tableData.x=$("#svg-canvas [id='"+node+"']").offset().top;
            			  tableData.y=$("#svg-canvas [id='"+node+"']").offset().left;
        			  }
        			  groups.push(tableData);
        		  }
        		  callback(groups);
    		  };

        	 //分层寻找
            function sortByLayer(superThis,callback){
            	var layerLeft_Top = {};
            	var layerWidth = 800; //每一层宽度
            	var margin_top = 50;
            	var ct =0;
            	var groups = superThis.getGroups();
            	$(groups).each(function(index,schema){
            		if(!layerLeft_Top[schema.schema]){
            			layerLeft_Top[schema.schema]={left:ct*layerWidth,top:50} ;
            			ct++;
            		}
            		
            	})
            	
            	$(groups).each(function(index,item){
            		var WH =  getHW(item);
            		item.y = layerLeft_Top[item.schema].left;
            		item.x = parseInt(layerLeft_Top[item.schema].top)+margin_top;
            		layerLeft_Top[item.schema].top  = parseInt(layerLeft_Top[item.schema].top + WH.height+margin_top);
            	});
            	
            	callback(groups);
            };
            	
        	// 使用树形结构寻找位置
        	function sqlflow(superThis,callback){
        		superThis.def.sqlflowgraph(function(data){
        			var  groups = superThis.getGroups();
        			$(groups).each(function(index,item){
        				$(data).each(function(index2,item2){
        					if(item2.entity_sid == item.entity_sid){
        						item.x = item2.x;
                        		item.y = item2.y;
                        		return false;
        					}
        				})
                	});
        			callback(groups);
        		});
        	};
        	
        },
        _getGroup:function(entity_sid){
        	var item = $("#"+this.def.containerId).find("#"+entity_sid);
    		var tableCell =  new Array();
    		$(item).find("li").each(function(index2,item2){
    			var modify_type ="";
    			if($(item2).attr('class').indexOf("delModel")!=-1){
	        		modify_type= "删除"
	        	}else if($(item2).attr('class').indexOf("addModel")!=-1){
	        		modify_type= "新增"
	        	}
    			tableCell.push({
    				schema:$(item2).attr("schema"),
    				entity_sid:$(item2).attr("entity_sid"),
    				model_sid:$(item2).attr("id"),
    				entity:$(item2).attr("entity"),
    				model:$(item2).attr("model"),
    				modify_type:modify_type
    			})
    		})
    		var modify_type ="";
    		if($(item).attr('class')){
    			if($(item).attr('class').indexOf("delEntity")!=-1){
            		modify_type= "删除"
            	}else if($(item).attr('class').indexOf("addEntity")!=-1){
            		modify_type= "新增"
            	}
    		}
			
        	return {
			schema:$(item).attr("schema"),
			entity_sid:$(item).attr("entity_sid"),
			entity:$(item).attr("entity"),
			x:parseInt($(item).css("top")),
			y:parseInt($(item).css("left")),
			tableCell:tableCell,
			modify_type:modify_type
        	};
        },
        _getPosition:function(tableData,rowct){
        	return {
    			top:tableData.x,
    			left:tableData.y
    		};
        },
        _getWidth:function(str){
        	var b = 0; l = str.length;  //初始化字节数递加变量并获取字符串参数的字符个数
            if(l) {  //如果存在字符串，则执行计划
                for(var i = 0; i < l; i ++) {  //遍历字符串，枚举每个字符
                    if(str.charCodeAt(i) > 255) {  //字符编码大于255，说明是双字节字符
                        b += 2;  //则累加2个
                    }else {
                        b ++;  //否则递加一次
                    }
                }
                return b;  //返回字节数
            } else {
                return 0;  //如果参数为空，则返回0个
            }
        },
        getConnections:function(){
        	var connections = this.def.instance.getAllConnections();
        	var data = new Array();
        	
	        for(var i in connections){
	        	var modify_type ="";
	        	var xx = connections[i].canvas;
	        	if($(connections[i].canvas).attr('class').indexOf("delConsanguinity")!=-1){
	        		modify_type= "删除"
	        	}else if($(connections[i].canvas).attr('class').indexOf("addConsanguinity")!=-1){
	        		modify_type= "新增"
	        	}
	        	data.push({
	        		source_sid:connections[i].sourceId,
	        		target_sid:connections[i].targetId,
	        		source_model_sid:connections[i].sourceId,
	        		target_model_sid:connections[i].targetId,
	        		source_entity_sid:$(connections[i].source).attr("tableid"),
	        		target_entity_sid:$(connections[i].target).attr("tableid"),
	        		source_entity:$(connections[i].source).attr("entity"),
	        		target_entity:$(connections[i].target).attr("entity"),
	        		source_model:$(connections[i].source).attr("model"),
	        		target_model:$(connections[i].target).attr("model"),
	        		modify_type:modify_type
	        		});
	        	}
        	return data;
        },
        getGroups:function(){
        	var superThis = this;
        	var group = new Array();
        	$(".group-container").each(function(index,item){
        		group.push(superThis._getGroup($(item).attr("id")));
        		
        	})
        	
        	return group;
        },
        _initTable:function(){
        	var superThis = this;
        	$(this.def.initTableData).each(function(index,item){
        		if(item.name =="cell"){
        			return ;
        		}else{
        			document.getElementById(superThis.def.containerId).appendHTML(superThis._getTableHtml(item));
        		}
        	});
        },
        _setSchemaColors:function(bool){
        	var superThis = this;
        	var ct = 0;
        	var schema = {};
        	$(superThis.getGroups()).each(function(index,item){
        		if(!schema[item.schema]){
        			schema[item.schema]= ct++;
        		}
        	});
        	
        	$(superThis.getGroups()).each(function(index,item){
        		if(!bool){
            		$(".group-container[schema='"+item.schema+"']").removeClass("color"+schema[item.schema]);
            	}else{
            		$(".group-container[schema='"+item.schema+"']").addClass("color"+schema[item.schema]);
            	}
        	});
        	
        	
        },
        _getTableHtml:function(cellData,position){
        	var cellHtml = '';
        	var superThis = this;
        	$(cellData).each(function(index,item){
        		if(!item.tableCell){
            		return ;
            	}
        		if(!position){
        			position = superThis._getPosition(item,item.tableCell.length);
        		}
        		
        		var modify_type ="";
        		if(item.modify_type == "删除"){
    				modify_type='delEntity';
    			}else if(item.modify_type == "新增"){
    				modify_type='addEntity';
    			}else{
    			}
        		
        	
        		var table_name = "";
    			if(item.chinese_name){
    				table_name="("+item.chinese_name+")";
        		}
    			var tableWidth = superThis._getWidth(item.name+table_name)*10;
        		cellHtml +=
        			'<div class="group-container '+modify_type+'"  id="'+item.sid+'"    schema ="'+item.schema+'" entity = "'+item.entity+'" entity_sid="'+item.sid+'" type="'+item.type+'" style="top:'+position.top+'px;left:'+(position.left)+'px;" \
        			style="" group="'+item.entity_sid+'" >\
                    <div class="title">'+item.name+table_name+'</div>\
                    <div class="node-collapse"></div>\
                    <ul>';
        		$(item.tableCell).each(function(index2,item2){
        			cellHtml+= superThis._getTableCellHtml(item2);
        		});
        		cellHtml += 
        			'</ul>\
                </div>';
        	})
        	return cellHtml;
        },
        _getTableCellHtml:function(item){
        	var cellHtml ="";
			var model_name = "";
			if(item.chinese_name){
				model_name="("+item.chinese_name+")";
    		}
			var modify_type ="";
			if(item.modify_type == "删除"){
				modify_type='delModel';
			}else if(item.modify_type == "新增"){
				modify_type='addModel';
			}else{
			}
			
			cellHtml += '<li  id="'+item.sid+'" class="'+modify_type+'"  tableid="'+item.entity_sid+'"  schema ="'+item.schema+'" entity = "'+item.entity+'" entity_sid="'+item.entity_sid+'"  model="'+item.model+'" model_sid="'+item.sid+'"  ><font >'+item.name+"</font>"+model_name+'</li>';
			return cellHtml;
        	
        },
        _initGroup:function(){
        	var containers = document.querySelectorAll(".group-container");
        	var superThis = this;
        	containers.forEach(function(item,index,containers){
        		// 判断该group 是否存在
        		if(!superThis.def.instance._groups || !superThis.def.instance._groups[item.getAttribute("group")]){
        			superThis.def.instance.addGroup({
            	        el:item,
            	        id:item.getAttribute("group"),
            	        constrain:true,
            	        anchor:"Continuous",
            	        endpoint:"Blank",
            	        droppable:false
            	    });
            		
            		superThis.def.instance.batch(function () {
            	        var lists = item.querySelectorAll("ul li");
            	        for (var i = 0; i < lists.length; i++) {
            	        	superThis.def.instance.makeSource(lists[i], {
            	                 allowLoopback: false,
            	                 anchor: ["Left", "Right" ],
            	        		 extract:{
            	                     "action":"the-action"
            	                 }
            	             });
            	        	superThis.def.instance.makeTarget(lists[i], {
            	                 anchor: ["Left", "Right" ],
            	                 extract:{
            	                     "action":"the-action"
            	                 }
            	             });
            	        }
            	       
            	    });
        		}
        		
        	});
        	superThis.def.groupLoadComplete();
        },
        _addColumn:function(groupID,columnData){
        	var superThis = this;
        	// 判断是否存在
        	if($('#'+groupID).find("#"+columnData.sid).length == 0){
        		var cellHtml =	superThis._getTableCellHtml(columnData);
            	$("#"+groupID).find("ul").append(cellHtml);
            	setTimeout(function(){
            		superThis.def.instance.makeSource($("#"+groupID).find("#"+columnData.sid)[0], {
                        allowLoopback: false,
                        anchor: ["Left", "Right" ],
               		 extract:{
                            "action":"the-action"
                        }
                    });
               	superThis.def.instance.makeTarget($("#"+groupID).find("#"+columnData.sid)[0], {
                        anchor: ["Left", "Right" ],
                        extract:{
                            "action":"the-action"
                        }
                    });
            	},0)
            	
        	}
        	
        },
        _removeColumn:function(el){
        	this.def.instance.remove(el);
        },
        _removeGroup:function(el){
        	this.def.instance.remove(el);
        	this.def.instance.removeGroup(el);
        },
        _objToArr:function(_arr){
        	var results = [];
        	function objToArr(arr){
        		$(arr).each(function(index,item){
        			results.push(item.connect)
        			if(item.children){
        				objToArr(item.children);
        			}
        		});
        	}
        	objToArr(_arr);
        	return results;
        },
        _arrToTable:function(array){
        	var results =[];
        	var results_part1 =[];
        	var results_part2 =[];
        	function arrToTable_part(obj,parentArr){
        		var thisarr =[];
        		var cparr = $.extend(true, [], parentArr)
        		if(obj.direction=="source"){
        			cparr.unshift(obj.item);   
        		}else{
        			cparr.push(obj.item);   
        		}
    			if(obj.children && obj.children.length>0){
    				$(obj.children).each(function(index,item){
    					var res = arrToTable_part(item,cparr);
    					$(res).each(function(index2,item2){
    						thisarr.push(item2);
    					})
    				})
    			}else{
    				thisarr.push(cparr);
    				return thisarr;
    			}
    			return thisarr;
        	}
        	$(array).each(function(index,item){
        		var res = arrToTable_part(item,[item.parent]);
				$(res).each(function(index2,item2){
					if(item.direction=="source"){
						results_part1.push(item2);
					}else{
						results_part2.push(item2);
					}
					
				})
        		
        	});
        	if(results_part1.length>0 && results_part2.length>0 ){
        		$(results_part1).each(function(index1,source){
            		$(results_part2).each(function(index2,target){
            			Array.prototype.push.apply(source,target.slice(1,target.length));
            			results.push(source);
            		});
            	})
        	}else if(results_part2.length>0) {
        		$(results_part2).each(function(index2,target){
        			results.push(target);
        		});
        	}else {
        		$(results_part1).each(function(index,source){
        			results.push(source);
        		});
        	}
        	var results2 =[];
        	$(results).each(function(index,result){
        		var temp =[];
        		$(result).each(function(index2,item2){
        			temp.push($("#"+item2).attr("name"))
        		})
        		results2.push(temp);
        	});
        	
        	return results2;
        },
        _addAction:function(){
        	var superThis = this;
        	var trigger2,trigger;
        	var hasshow =false;
        	$('.group-container ul li').unbind("click").click(function(){
        		if(!$(this).attr("selected")){
        			$('.group-container ul li').removeAttr("selected");
        			$(this).attr("selected","true");
        		}else{
        			$(this).removeAttr("selected");
        		}
        	});
        	
        	$('.group-container ul li').unbind("hover").hover(function(){
        		if($('.group-container ul [selected]').length>0){
        			return;
        		}
        		$(this).addClass("hover");
        		var id = $(this).attr("id");
        		trigger = setTimeout(function(){
        			//鼠标移上显示血缘 -1/影响 1/全链  0 
					var showType = 0;
					if ($(".relate.selected").attr("value")) {
						showType = $(".relate.selected").attr("value");
					}
        			hasshow = true;
	           		var results = superThis._getRelateConnects([[id],[id]],showType,[[id],[id]]);
	           		var result = superThis._objToArr(results);
	           		superThis.def.selectedItem(id,superThis._getCoordinates(id));
	           		var tableResult  = superThis._arrToTable(results);
	           		superThis.def.relateChanged(tableResult,id);
	           		
	           		result.forEach((item,index,array)=>{
	           			try {
	           				$(item.canvas).attr("realType",item.getType()) ;
	           				
	           				item.setType('relate');
		           			if(item.getOverlays().__label){
		           				$(item.getOverlays().__label.canvas).addClass("show");
		           			}
		           			$(item.canvas).css("z-index","2");
		           			$("[id='"+item.sourceId+"']").addClass("hover");
		       				$("[id='"+item.targetId+"']").addClass("hover");
						} catch (e) {
							// TODO: handle exception
						}
	           			
           			})
               },1000);
    		},function(){
    		clearTimeout(trigger);
    		if($('.group-container ul [selected]').length>0){
    			return;
    		}
    		$(".hover").removeClass("hover");
        	var id = $(this).attr("id");
        	if(hasshow){
        		hasshow =false;
				var showType = 0;
				if ($(".relate.selected").attr("value")) {
					showType = $(".relate.selected").attr("value");
				}
        		superThis.def.selectedItem();
        		var results = superThis._getRelateConnects([[id],[id]],showType,[[id],[id]]);
        		var result = superThis._objToArr(results);
        		$(result).each(function(index,item){
        			try {
        				if($(item.canvas).attr("realType")){
        					
        					item.setType($(item.canvas).attr("realType"));
        				}else{
        					item.setType('base');
        				}
                		if(item.getOverlays().__label){
                			$(item.getOverlays().__label.canvas).removeClass("show");
                		}
                		$(item.canvas).css("z-index","1");
					} catch (e) {
						// TODO: handle exception
					}
        		})
        	}
    		});
            //开关详情
            $(".node-collapse").unbind("click").click( function() {
    	        var collapsed = $(this).hasClass("collapsed");
    	        if(!collapsed){
    	        	$(this).addClass("collapsed");
    	        	$(this).parent().addClass("collapsed");
    	        }else{
    	        	$(this).removeClass("collapsed");
    	        	$(this).parent().removeClass("collapsed");
    	        }
    	        
    	        superThis.def.instance.repaintEverything();
    	    });
            
            //避免在同一个点
            superThis.def.instance.unbind("beforeDrop").bind('beforeDrop', function (conn) {
                if (conn.sourceId === conn.targetId) {
                  return false
                } else if($(conn.connection.source).attr("tableid") == $(conn.connection.target).attr("tableid")) {
                	return false;
                }else{
                  return true
                }
              })
             
            //全局
			//显示关系
			$('body').delegate('.showDetail', 'lcs-statuschange', function() {
				var status = ($(this).is(':checked')) ? 'checked' : 'unchecked';
				if(status == "checked"){
					$(this).removeClass("show");
					$(".node-collapse").addClass("collapsed");
					$(".node-collapse").parent().addClass("collapsed");
				}else{
					$(this).addClass("show");
					$(".node-collapse").removeClass("collapsed");
					$(".node-collapse").parent().removeClass("collapsed");
				}
				superThis.def.instance.repaintEverything();

				superThis.def.viewChanged();
			});
            //显示详情
            $(".showDetail").unbind("click").click(function(){
            	var show =$(this).hasClass("show");
	        	 if(!show){
	        		 $(this).addClass("show");
	        		 $(".node-collapse").removeClass("collapsed");
	        		 $(".node-collapse").parent().removeClass("collapsed");
	        		 //$(".node-collapse.collapsed").click();
	        	 }else{
	        		 $(this).removeClass("show");
	        		 $(".node-collapse").addClass("collapsed");
	        		 $(".node-collapse").parent().addClass("collapsed");
	        		// $(".node-collapse").not(".collapsed").click();
	        	 }
	        	 $(this).text(show?"显示详情":"隐藏详情");
	        	 
	    	     superThis.def.instance.repaintEverything();

	        	 superThis.def.viewChanged();
            });
            // 显示隐藏变动
            $("#"+superThis.def.containerId).attr("class","showAllChange");
            $(".showChange").unbind("click").click(function(){
	        	var show =$(this).hasClass("show");
	        	 $(this).text(!show?"显示变动":"隐藏变动");
	        	var clickthis = this;
	        	 if(show){
	        		 $(this).removeClass("show");
	        		 $("#"+superThis.def.containerId).attr("class","showAllChange");
	        		 var connections = superThis.def.instance.getAllConnections();
	        		 $(connections).each(function(index,item){
	        			 $(item.endpoints).each(function(index2,endpoint){
	        				 $(endpoint.canvas).css("display","block");
	        			 })
	        			 item.setType($(item.canvas).attr("realType"));
	        		 })
	        		
	        	 }else{
	        		 $(this).addClass("show");
	        		
	        		 $("#"+superThis.def.containerId).attr("class","hideAllChange");
	        		 var connections = superThis.def.instance.getAllConnections();
	        		 $(connections).each(function(index,item){
	        			 $(item.endpoints).each(function(index2,endpoint){
	        				 $(endpoint.canvas).css("display","none");
	        			 })
	        			 $(item.canvas).attr("realType",item.getType()) ;
	        			 item.setType("base");
	        		 })
	        	 }
	        	
	        	 superThis.def.viewChanged();
	        });
            
            
            // 赋予schema颜色 
            $(".colorSchema").unbind("click").click(function(){
            	
            	 var show =$(this).hasClass("selected");
               	 if(!show){
               		 $(this).addClass("selected");
               	 }else{
               		 $(this).removeClass("selected");
               	 }
               	superThis._setSchemaColors(!show);
    	     })

            //显示关系
             $(".showRelate").click(function(){
            	var show =$(this).hasClass("show");
	        	 if(!show){
	        		 $(this).addClass("show");
	        		 $(".jtk-overlay").addClass("show");
	        	 }else{
	        		 $(this).removeClass("show");
	        		 $(".jtk-overlay").removeClass("show");
	        	 }
	        	// $(this).text(show?"显示关系":"隐藏关系");
            })
            
            //默认关闭
           // $(".node-collapse").click();
            superThis.def.viewChanged();
            // 缩小
            $(".toSmall").unbind("click").click(function(){
            	_grlbalTransform -= 0.05;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            	$("#svg-canvas").css("transform","scale("+_grlbalTransform+")");
            	
            })
            _grlbalTransform = 1;
            $(".toSmall").click();
            //放大
            $(".toBig").unbind("click").click(function(){
            	_grlbalTransform += 0.05;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            	$("#svg-canvas").css("transform","scale("+_grlbalTransform+")");
            })
            //还原
            $(".toReal").unbind("click").click(function(){
            	_grlbalTransform = 1;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            	$("#svg-canvas").css("transform","scale("+_grlbalTransform+")");
            })
            
            //血缘影响全链
            $(".relate").unbind("click").click(function(){
            	$(".relate").removeClass("selected");
            	$(this).addClass("selected");
            })
            
            $(".tablePosition").unbind("click").click(function(){
//            	$(superThis.def.tableData).each(function(index,item){
//            		 let tableData = superThis._getGroup(item.entity_sid);
//       			  if(tableData){
//       				  tableData.x=null;
//           			  tableData.y=null;
//       			  }
//            	});
            	superThis._setPosition($(this).attr("type"));
            })
            
            // 获取鼠标点击位置
            function getMousePos(event) {
	            var e = event || window.event;
	            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
	            var x = e.pageX || e.clientX + scrollX;
	            var y = e.pageY || e.clientY + scrollY;
	            return { 'left': x, 'top': y };
            }
            
            // 右键功能添加
          /* $('#canvas').contextPopup({
	          title: '动作',
	          items: [
	            {
	            	label:'添加表',    
	            	icon:ctx+'/sjzl/history/css/images/application-monitor.png',             
	            	action:function(e) {
	            		parent.window["selectTable"](function(data){
	            			if($("#"+data[0].sid).length==0){
	            				document.getElementById(superThis.def.containerId).appendHTML(superThis._getTableHtml(data,getMousePos(e)));
		            			superThis._initGroup();
		            			superThis._addAction();
	            			}
	            			
	            		})
	            	}
	            }]
           });*/
            
	        /*$('.group-container').contextPopup({
	          title: '动作',
	          items: [
	            {
	            	label:'添加字段',    
	            	icon:ctx+'/sjzl/history/css/images/application-monitor.png',             
	            	action:function(e) {
	            		parent.window["selectTableColumn"]($(e.currentTarget).attr("id"),function(datas){
	            			$(datas).each(function(index,data){
	            				if(!data.children){
	            					superThis._addColumn($(e.currentTarget).attr("id"),data);
		            				superThis._addAction();
	            				}
	            				
	            			})
	            			
	            		})
	            	}
	            },
	            {
	            	label:'删除表',    
	            	icon:ctx+'/sjzl/history/css/images/application-monitor.png',             
	            	action:function(e) {
	            		superThis._removeGroup($(e.currentTarget).attr("id"));
	            	}
	            }]
	         });*/
	        /*$('.group-container li').contextPopup({
	          title: '动作',
	          items: [
	            {
	            	label:'删除字段',    
	            	icon:ctx+'/sjzl/history/css/images/application-monitor.png',             
	            	action:function(e) {
	            		superThis._removeColumn($(e.currentTarget).attr("id"));
	            	}
	            }]
	         });*/
            
            return;
        	},
        _getRelateConnects:function(idsAll,showtype,ids){
		    var superThis = this;
		    var connections = superThis.def.instance.getAllConnections();
			var results = [];
			if((showtype == 0 || showtype == 1) ){
				var nextIds = [[],[]];
				$(ids[1]).each(function(index2,item2){
					$(connections).each(function(index,item){
						if(item2 == item.sourceId){
							if($.inArray(item.targetId,idsAll[1]) == -1){
								idsAll[1].push(item.targetId);
								nextIds[1].push(item.targetId);
								results.push({item:item.targetId,connect:item,children:superThis._getRelateConnects(idsAll,1,nextIds)});
							}
		        		} 
					});
				});
			}
			if((showtype == 0 || showtype == -1)){
				var nextIds = [[],[]];
				$(ids[0]).each(function(index2,item2){
					$(connections).each(function(index,item){
						if(item2 == item.targetId){
		        			if($.inArray(item.sourceId,idsAll[0]) == -1){
		        				idsAll[0].push(item.sourceId);
		        				nextIds[0].push(item.sourceId);
		        				results.push({connect:item,children:superThis._getRelateConnects(idsAll,-1,nextIds)});
		        			}
		        		}
					});
				});
			}
			
			return results;
        },
        _getLineLength:function(source,target){
        	try {
        		 var a = source.left-target.left;
                 var b = source.top-target.top;
                 return Math.sqrt(a*a+b*b)/1.5;
			} catch (e) {
				return 200;
			}
           
        },
        _initConnections:function(){
        	if(!this.def.initConnectionData){
        		return;
        	}
        	
        	var superThis = this;
        	$(this.def.initConnectionData).each(function(index,item){
    				setTimeout(function(){
    					try {
    						
    						function getLineLength(source_id,target_id){
    							var length = superThis._getLineLength($("#"+source_id).offset(),$("#"+target_id).offset());
    							return length/4;
    						}
    						var modify_type="";
    						var label = item.consanguinity_type;
    						if(item.modify_type == "删除"){
    							modify_type='delConsanguinity hover';
    							label = "已删除关系";
            				}else if(item.modify_type == "新增"){
            					modify_type='addConsanguinity hover';
            					label = "新增关系";
    						}else{
            				}
    						
    						var cc = superThis.def.instance.connect({
            					source:item.source_id ,
            					target:item.target_id,
            					source_id:item.source_id,
            					target_id:item.target_id,
            					label:label,
            					cssClass:modify_type
            					},
            					{
            						connector:['Bezier', { curviness: getLineLength(item.source_id,item.target_id)}]
            					}
            					);
    						
            				if(item.modify_type == "删除"){
            					cc.setType('del');
            					debugger;
            				}else if(item.modify_type == "新增"){
            					cc.setType('add');
    						}else{
    							if(item.source_clausetype == undefined || item.source_clausetype == ""){
                					cc.setType('base');
                				}else{
                					//cc.setType('base');
                					cc.setType('dash_showrelate');
                				}
            				}
            				 
						} catch (e) {
							console.log("error"+item.source_id+"->"+item.target_id)
						}
						if(superThis.def.initConnectionData.length == index){
							superThis.def.instance.drowEnd();
						}
        			   
    				},0)
        	});
        }
    }

    _global = (function(){ return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Table;
    } else if (typeof define === "function" && define.amd) {
        define(function(){return Table;});
    } else {
        !('Table' in _global) && (_global.Table = Table);
    }
}());