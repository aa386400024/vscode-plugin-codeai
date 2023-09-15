;(function(undefined) {
    var _global;
    var _grlbalTransform = 1;
    //鼠标移上显示血缘 0/影响 1/全链  2 
	var showType =0;
    function extend(o,n,override) {
        for(var key in n){
            if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)){
                o[key]=n[key];
            }
        }
        return o;
    };
    HTMLElement.prototype.appendHTML = function(html) {
        var divTemp = document.createElement("div"), nodes = null
            , fragment = document.createDocumentFragment();
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
                tableData:[],
                connectionData:[],
                connects:[],
                tableWidth:400,
                breakCount:10, 
                instance:null
            };
       	 	this.def = extend(def,opt,true); 
       	 	var superThis = this;
            jsPlumb.ready(function () {
            	superThis.def.instance = 
            		jsPlumb.getInstance({
            		Container:canvas,
            		Connector:['Bezier', { curviness: 80 }],
            		EndpointStyle: { fill: "#ffa500" },
            		ListStyle:{
                        endpoint:[ "Rectangle", { width:30, height:30 }]
                    },
            		curviness:1,
                	ConnectionOverlays: [ 
                	            ["Arrow", {  
                	                location: 1,
                	                visible: true,
                	                width: 10,
                	                length: 20,
                	                id: "ARROW",
                	                events: {
                	                    click: function () {
                	                    }
                	                }
                	            }]],
            		Endpoint:["Dot", {radius:2}],
            		Anchor:"Center",
            		overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "Drag",
                            cssClass: "endpointSourceLabel",
                            visible:true
                        } ]
                    ]
        			});
            	superThis._setAllTablePosition();
            	superThis._initTable();
            	superThis._addGroup();
            	superThis._addConnections();
            	superThis._addAction();
            })
           
        },
        _createTable:function (data){
        	
        },
        _setAllTablePosition:function(){
        	
        	// 对表格进行排序
        	var node1x = 0;
        	var superThis = this;
        	var hasPTable = [];
        	var postObject={name:"root",children:[]};
        	// 默认全部归0,0
        	getFistTable();
        	function getFistTable(){
        		$(superThis.def.tableData).each(function(index,item){
        			var has = false;
        			$(superThis.def.connectionData).each(function(index2,item2){
        				if(item.entity_sid == item2.target_entity_sid){
        					has = true;
        				}
        			});
        			if(!has){
        				postObject.children.push(
        						{name:item.entity_sid,
        						size:superThis._getTableData(item.entity_sid).tableCell.length,
        						children:getChildrens(item.entity_sid,hasPTable)
        						});
        			}
            	});
        		console.log(JSON.stringify(postObject))
        		 var oxy =  getXY(postObject);
        		 console.log(oxy)
        		 var width = oxy.x*600; // 高
        		 var height = oxy.y*600;//宽
        		 
    	         var tree = d3.layout.cluster()
    	         .size([width, height-200])
    	         .separation(function(a, b) {
    	          let result = a.parent === b.parent && !a.children && !b.children ? 1 : 2;
    	          if (result > 1) {
    	              let length = 0;
    	              length = a.children ? (length + a.children.length) : length;
    	              length = b.children ? (length + b.children.length) : length;
    	              result = length / 2 + 0.5;
    	            }
    	            return result;});

        	     var nodes = tree.nodes(postObject);
   	        	 setPostrionByNodes(postObject.children);
   	        	 
   	        	 
   	        	 function setPostrionByNodes(children){
   	        		 $(children).each(function(index,item){
   	        			 var tableData = superThis._getTableData(item.name);
   	        			 if(item.depth == 1){
   	        				node1x = item.y;
   	        			 }
   	        			 if(tableData){
   	        				 tableData.x=item.x;
	  	        			 tableData.y=item.y- node1x;
	  	        			 tableData.depth=item.depth;
	  	        			 if(item.children && item.children.length>0){
	  	        				setPostrionByNodes(item.children);
	  	        			 } 
   	        			 }
   	        			 
   	        		 })
   	        	 }
        	};
        	
        	function getChildrens(entity_sid,tTable){
        		var children = [];
        		var children_entity = [];
        		$(superThis.def.connectionData).each(function(index,item){
    				if(entity_sid == item.source_entity_sid){
    					if($.inArray(item.target_entity_sid,tTable) == -1){
    						tTable.push(entity_sid);
    						if($.inArray(item.target_entity_sid,children_entity) == -1){
    							children_entity.push(item.target_entity_sid);
    							children.push({
        							name:item.target_entity_sid,
        							size:superThis._getTableData(item.target_entity_sid).tableCell.length,
        							children:getChildrens(item.target_entity_sid,tTable)
        							});
    						}
    					}
    				}
        		});
        		return children;
        	}
        	

        	function getXY(obj){
        		var oy = 0;
            	var ox = 0;
            	function getXYPart(obj,ooy){
            		ox = ox>obj.children.length?ox:obj.children.length;
            		oy =oy<ooy?ooy:oy;
            		$(obj.children).each(function(index,item){
            			getXYPart(item,ooy+1);
            		})
            	}
            	getXYPart(obj,0);
            	return {x:ox,y:oy};
        	}
        	
        },
        _getTableData:function(entity_sid){
        	var theitem = null;
        	$(this.def.tableData).each(function(index,item){
        		if(item.entity_sid == entity_sid){
        			theitem =item;
        		}
        	});
        	return theitem;
        },
        _getPosition:function(tableData,rowct){
        	return {
    			top:tableData.x,
    			left:tableData.y
    		};
        },
        getConnections:function(){
        	var connections = this.def.instance.getAllConnections();
        	var data = new Array();
	        for(var i in connections){
	        	data.push({
	        		source_id:connections[i].sourceId,
	        		target_id:connections[i].targetId,
	        		source_entity_id:$(connections[i].source).attr("tableid"),
	        		target_entity_id:$(connections[i].target).attr("tableid")
	        		});
	        	}
        	return data;
        },
        getGroups:function(){
        	
        	var group = new Array();
        	var groups = this.def.instance._groups;
        	for(let item  in groups){
        		group.push({
        			table_name:item
        			})
        	}
        	return group;
        },
        _initTable:function(){
        	var superThis = this;
        	$(this.def.tableData).each(function(index,item){
        		document.getElementById(superThis.def.containerId).appendHTML(superThis._getTableCellHtml(item,index));
        	});
        	// 连线样式  灰色实线
        	let setting = {
    			    paintStyle: {stroke: '#ababab', strokeWidth: 1},
    			    connectorStyle: {stroke: '#ababab', strokeWidth: 1},
    			    connectorHoverStyle: {stroke: '#ababab', strokeWidth: 1 },
    			    hoverPaintStyle: { stroke: '#ababab', strokeWidth: 1 }
    		 };
        	superThis.def.instance.registerConnectionType('base', setting);
        	
        	// 连线样式 黑色实线
        	setting = {
    			    paintStyle: {stroke: '#000000', strokeWidth: 2 },
    			    connectorStyle: {stroke: '#000000', strokeWidth: 2},
    			    connectorHoverStyle: {stroke: '#000000', strokeWidth: 2 },
    			    hoverPaintStyle: { stroke: '#000000', strokeWidth: 2 }
    		 };
        	superThis.def.instance.registerConnectionType('showrelate', setting);
        	
        	// 连线样式 黑色虚线
        	setting = {
    			    paintStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4" },
    			    connectorStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4"},
    			    connectorHoverStyle: {stroke: '#000000', strokeWidth: 1,"dashstyle": "2 4" },
    			    hoverPaintStyle: { stroke: '#000000', strokeWidth: 1 ,"dashstyle": "2 4"}
    		 };
        	superThis.def.instance.registerConnectionType('dash_base', setting);
        	
        	// 连线样式 灰色虚线
        	setting = {
    			    paintStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "2 4" },
    			    connectorStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "2 4"},
    			    connectorHoverStyle: {stroke: '#ababab', strokeWidth: 1,"dashstyle": "2 4" },
    			    hoverPaintStyle: { stroke: '#ababab', strokeWidth: 1 ,"dashstyle": "2 4"}
    		 };
        	superThis.def.instance.registerConnectionType('dash_showrelate', setting);
        },
        _getTableCellHtml:function(cellData,ct){
        	var cellHtml = '';
        	var superThis = this;
        	$(cellData).each(function(index,item){
        		var position = superThis._getPosition(item,item.tableCell.length);
        		
        		
        		cellHtml +=
        			'<div class="group-container" style="top:'+position.top+'px;left:'+position.left+'px" id="'+item.entity_sid+'" \
        			style="" group="'+item.entity_sid+'" >\
                    <div class="title">'+item.entity_sid+'</div>\
                    <div class="node-collapse"></div>\
                    <ul>';
        		$(item.tableCell).each(function(index2,item2){
        			var attribute_chinese_name = "";
        			if(item2.attribute_chinese_name){
        				attribute_chinese_name="("+item2.attribute_chinese_name+")";
            		}
        			cellHtml += '<li  tableid="'+item.entity_sid+'" id="'+item2.sid+'"><font class="bold">'+item2.attribute_english_name+"</font>"+attribute_chinese_name+'</li>';
        		});
        		cellHtml += 
        			'</ul>\
                </div>';
        	})
        	return cellHtml;
        },
        _addGroup:function(){
        	var containers = document.querySelectorAll(".group-container");
        	var superThis = this;
        	containers.forEach(function(item,index,containers){
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
        	});
        },
        _addAction:function(){
        	var superThis = this;
        	
        	 $('.group-container ul li').unbind("mouseenter").bind("mouseenter",function() {
        		
        		 var id = $(this).attr("id");
        		$(this).addClass("hover");
        		var result = superThis._getRelateConnects(superThis.def.connects,[id],1,[],showType,0);
        		result.forEach((item,index,array)=>{
        			item.connect.setType('showrelate');
        			$(item.connect.getOverlays().__label.canvas).addClass("show");
        			$("[id='"+item.source_id+"']").addClass("hover");
    				$("[id='"+item.target_id+"']").addClass("hover");
        		});
            });
            $('.group-container ul li').unbind("mouseleave").bind("mouseleave",function() {
            	$(".hover").removeClass("hover");
            	var id = $(this).attr("id");
            	
            	var result = superThis._getRelateConnects(superThis.def.connects,[id],1,[],showType,0);
            	$(result).each(function(index,item){
            		item.connect.setType('base');
            		$(item.connect.getOverlays().__label.canvas).removeClass("show");
            	});
            }); 
            
            //开关详情
            superThis.def.instance.on(canvas, "click", ".node-collapse", function() {
    	        var collapsed = superThis.def.instance.hasClass(this, "collapsed");
    	        superThis.def.instance[collapsed ? "removeClass" : "addClass"](this, "collapsed");
    	        superThis.def.instance[collapsed ? "removeClass" : "addClass"](this.parentNode, "collapsed");
    	        superThis.def.instance.repaintEverything()
    	    });
            
            //避免在同一个点
            superThis.def.instance.bind('beforeDrop', function (conn) {
                if (conn.sourceId === conn.targetId) {
                  return false
                } else if($(conn.connection.source).attr("tableid") == $(conn.connection.target).attr("tableid")) {
                	return false;
                }else{
                  return true
                }
              })
             
            //全局 
            //显示详情
            $(".showDetail").click(function(){
            	var show =$(this).hasClass("show");
	        	 if(!show){
	        		 $(this).addClass("show");
	        		 $(".node-collapse.collapsed").click();
	        	 }else{
	        		 $(this).removeClass("show");
	        		 $(".node-collapse").not(".collapsed").click();
	        	 }
	        	 $(this).text(show?"显示详情":"隐藏详情");
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
	        	 $(this).text(show?"显示关系":"隐藏关系");
            })
            
            //默认关闭
            $(".node-collapse").click();
            
            // 缩小
            $(".toSmall").click(function(){
            	_grlbalTransform -= 0.05;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            })
            //放大
            $(".toBig").click(function(){
            	_grlbalTransform += 0.05;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            })
            //还原
            $(".toReal").click(function(){
            	_grlbalTransform = 1;
            	$("#"+superThis.def.containerId).css("transform","scale("+_grlbalTransform+")");
            })
            
            //血缘影响全链
            $(".relate").click(function(){
            	$(".relate").removeClass("selected");
            	$(this).addClass("selected");
            	showType = $(this).attr("value");
            })
            
        	},
        _getRelateConnects:function(connects,ids,length,results,showtype,toSource){
        	var superThis = this;
        	$(connects).each(function(index,item){
        		$(ids).each(function(index2,item2){
        			if((showtype == 1 || showtype == 2) && toSource>=0){
        				if(item2 == item.source_id  ){
        					results.push(item);
        					if($.inArray(item.target_id,ids) == -1){
        						ids.push(item.target_id);
        						superThis._getRelateConnects(connects,ids,ids.length,results,showtype,1);
        					}
                		} 
        			}
        			if((showtype == 0 || showtype == 2)&& toSource<=0){
	    				if(item2 == item.target_id){
	            			results.push(item);
	            			if($.inArray(item.source_id,ids) == -1){
	            				ids.push(item.source_id);
	            				superThis._getRelateConnects(connects,ids,ids.length,results,showtype,-1);
	            			}
	            		}
        			}
        		});
        	});
        	return results;
        },
        _addConnections:function(){
        	if(!this.def.connectionData){
        		return;
        	}
        	var superThis = this;
        	$(this.def.connectionData).each(function(index,item){
    			if(superThis.def.instance.isSource(document.getElementById(item.source_id))
    					&&superThis.def.instance.isTarget(document.getElementById(item.target_id))){
    				
    				var cc = superThis.def.instance.connect({
    					source:item.source_id ,
    					target:item.target_id,
    					label:item.consanguinity_type
    					});
    				
    				superThis.def.connects.push({
    					source_id:item.source_id ,
    					target_id:item.target_id,
    					connect:cc
    					});
    			    cc.setType('base');
    			}
            	
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