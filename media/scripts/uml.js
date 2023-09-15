/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/naming-convention */
(function () {
    let response = '';
    const list = document.getElementById("canvas");
    // Handle messages sent from the extension to the webview
    // 收到webview发来的message，判断类别并返回结果
    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {

            // 在页面中显示问题
            case "askQuestion":
                const html = marked.parse(message.question);
            
                // 前端页面展示提问的问题
                list.innerHTML = `<div class="p-4 self-end mb-4">
                          <p class="font-bold mb-5 flex">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              You
                          </p>
                          ${html}
                      </div>`;

                
                document.getElementById("in-progress")?.classList?.remove("hidden"); // 等待字样开启
                break;

            // 在页面中显示SQL血缘图谱
            case "addGraph":
                document.getElementById("in-progress")?.classList?.add("hidden"); // 等待字样隐藏
                // getGraph(message.value);
                getDataByConsanguinity_view(message.sqltext,message.sqltype) // 生成图谱
            default:
                break;
        }
    });


    // 从data信息中获取绘图信息并绘图(暂时无用)
    function getGraph (data){
        // let sqltext =data.sqltext;
        data = data.data;
        let tableDatas = [];
        let miny = 0;
        $(data.graph.elements.tables).each(function(index,item){
            let y = item.y+0 ;
            miny = miny < y?miny:y;
        })
        $(data.graph.elements.tables).each(function(index,item){
           let tableCells=[];
                $(item.columns).each(function(index2,item2){
                    let tableCell = {
                        column_coordinates:"66_12::66_21;",
                    entity:"TMP1_HIS_DEPUTYJOUR",
                    entity_sid:item.id.replace("::","_"),
                    model:item2.label.content,
                    model_sid:item2.id.replace("::","_"),
                    modify_date:null,
                    modify_type:null,
                    modify_user:null,
                    name:item2.label.content,
                    schema:null,
                    sid:item2.id.replace("::","_"),
                    x:item2.x,
                    y:item2.y,
                    };
                    tableCells.push(tableCell)
                })
            let tableData =  {
                column_coordinates:"65_32::65_51;",
                column_name:item.label.content,
                entity:item.label.content,
                entity_sid:item.id.replace("::","_"),
                model:"",
                model_sid:item.id.replace("::","_"),
                modify_date:null,
                modify_type:null,
                modify_user:null,
                name:item.label.content,
                schema:null,
                sid:item.id,
                type:getTableType(data.sqlflow.dbobjs,data.graph.listIdMap,item.id),
                x:(item.y-miny)*1.2,
                y:item.x*1.8,
                tableCell:tableCells
            };
            tableDatas.push(tableData)

        })
        let tableConnections =[];
        $(data.graph.elements.edges).each(function(index,item){
            let edge ={
                consanguinity_type:"",
                consanguinity_view_sid:"",
                data_source:"sqlparser",
                effecttype:"",
                modify_date:null,
                modify_type:null,
                modify_user:null,
                sid:item.id.replace("::","_"),
                source_clausetype:null,
                source_columntype:null,
                source_entity_sid:item.sourceId.replace("::","_"),
                source_id:item.sourceId.replace("::","_"),
                target_entity_sid:item.targetId.replace("::","_"),
                target_id:item.targetId.replace("::","_"),
                type:"fdd",
            };
            tableConnections.push(edge);
        })

        let result ={
        coordinates:null,
        data_from:"数据解析",
        data_source:"sqlparser",
        init_date:"",
        procedure_sid:"",
        processed_sql:sqltext,
        remarks:null,
        sid:"111",
        sql:sqltext,
        tableData:tableDatas,
        tableConnections:tableConnections
        };
        setData(result);
    };
    
    // 输入sql语句，发送post请求并绘图
    function  getDataByConsanguinity_view(sqltext,sqltype){
        $.ajax({
            async: true,
            url: "http://dms.citicsinfo.com/provenance/sjzl/gspLive_backend/sqlflow/generation/sqlflow/graph.vot",
            type: 'POST',
            data : {
                sqltext:window.btoa(encodeURIComponent(encodeURIComponent(sqltext))),
                dbvendor:sqltype,
                showRelationType:"fdd",
                ignoreFunction:"true",
                ignoreRecordSet:"false"
            },
            dataType: 'json',
            timeout: 30000,
            success: function(data){
                let sqltext =data.sqltext;
                data = data.data;
                let tableDatas = [];
                let miny = 0;
                $(data.graph.elements.tables).each(function(index,item){
                    let y = item.y+0 ;
                    miny = miny < y?miny:y;
                })
                $(data.graph.elements.tables).each(function(index,item){
                   let tableCells=[];
                        $(item.columns).each(function(index2,item2){
                            let tableCell = {
                                column_coordinates:"66_12::66_21;",
                            entity:"TMP1_HIS_DEPUTYJOUR",
                            entity_sid:item.id.replace("::","_"),
                            model:item2.label.content,
                            model_sid:item2.id.replace("::","_"),
                            modify_date:null,
                            modify_type:null,
                            modify_user:null,
                            name:item2.label.content,
                            schema:null,
                            sid:item2.id.replace("::","_"),
                            x:item2.x,
                            y:item2.y,
                            };
                            tableCells.push(tableCell)
                        })
                    let tableData =  {
                        column_coordinates:"65_32::65_51;",
                        column_name:item.label.content,
                        entity:item.label.content,
                        entity_sid:item.id.replace("::","_"),
                        model:"",
                        model_sid:item.id.replace("::","_"),
                        modify_date:null,
                        modify_type:null,
                        modify_user:null,
                        name:item.label.content,
                        schema:null,
                        sid:item.id,
                        type:getTableType(data.sqlflow.dbobjs,data.graph.listIdMap,item.id),
                        x:(item.y-miny)*1.2,
                        y:item.x*1.8,
                        tableCell:tableCells
                    };
                    tableDatas.push(tableData)
    
                })
                let tableConnections =[];
                $(data.graph.elements.edges).each(function(index,item){
                    let edge ={
                        consanguinity_type:"",
                        consanguinity_view_sid:"",
                        data_source:"sqlparser",
                        effecttype:"",
                        modify_date:null,
                        modify_type:null,
                        modify_user:null,
                        sid:item.id.replace("::","_"),
                        source_clausetype:null,
                        source_columntype:null,
                        source_entity_sid:item.sourceId.replace("::","_"),
                        source_id:item.sourceId.replace("::","_"),
                        target_entity_sid:item.targetId.replace("::","_"),
                        target_id:item.targetId.replace("::","_"),
                        type:"fdd",
                    };
                    tableConnections.push(edge);
                })
    
                let result ={
                coordinates:null,
                data_from:"数据解析",
                data_source:"sqlparser",
                init_date:"",
                procedure_sid:"",
                processed_sql:sqltext,
                remarks:null,
                sid:"111",
                sql:sqltext,
                tableData:tableDatas,
                tableConnections:tableConnections
                };
                setData(result);
            },
            error: function(){
    
            },
            complete: function(){
    
            }
        })
    
    }
    // 获取图表类型
    function getTableType(dbobjs,listIdMap,id){
        let type ="table";
        $(dbobjs).each(function(index,item){
           if(item.id == listIdMap[id][0]){
               type = item.type;
               return false;
           }
        })
        return type;
    }
    
    // 设置uml 图
    function setData(data){
    
        if(!data){
            return;
        }
    
        // setEditorContent(data.sql);
    
        table = new Table({
            containerId: 'canvas',
            initTableData:data.tableData,
            initConnectionData:data.tableConnections,
            coordinatesData:data.coordinates,
            sid:data.sid,
            groupLoadComplete:function(){
                groupLoadComplete();
            },
            drowEnd:function(){
                //groupLoadComplete();
            },
            viewChanged:function(){
                // groupLoadComplete();
            },
            relateChanged:function(tableResult,item){
                // relateChanged(tableResult,item);
            },
            selectedItem:function(item,coordinates){
                // selectedItem(item,coordinates);
            },sqlflowgraph:function(callback){
                sqlflowgraph(callback);
            }
        });
    
        function sqlflowgraph(callback){
            $.post(ctx+'/dataSqlFlowGraphController/sqlflowGraph.vot',{tableConnections:JSON.stringify(table.getConnections()),tableDatas:JSON.stringify(table.getGroups())},function(data){
                callback(data);
            },'json');
        }
    
        // smmap();
    }
    
    // 加载完成事件
    function groupLoadComplete(){
    
        if(!$("#canvas").attr("changeWH")){
            let bodyWidth =$("body")[0].scrollWidth - 40;
            let bodyHeight =$("body")[0].scrollHeight - 41;
            let minHeight = bodyHeight>$("#canvas")[0].scrollHeight?bodyHeight:$("#canvas")[0].scrollHeight;
            let minWidth = bodyWidth>$("#canvas")[0].scrollWidth?bodyWidth:$("#canvas")[0].scrollWidth;
    
            $("#canvas").css("height",minHeight+"px");
            $("#canvas").css("width",minWidth+"px");
            $("#canvas").attr("changeWH",true);
        }
    }

    

})();


