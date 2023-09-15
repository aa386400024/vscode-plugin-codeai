<%@ page language="java" pageEncoding="utf-8"%>
<jsp:include page="/include/init.jsp"/>
 <link rel="stylesheet" href="../youjian/jquery.contextmenu.css">
<div class="divButton">
		
	<div class="button save right">保存</div>
	
	
	<div class="button toleft  relate selected right" value="-1">血缘</div>
	<div class="button toall relate right" value="0">全链</div>
	<div class="button toright relate right" value="1">影响</div>
	
	<div class="button toSmall right">缩小</div>
	<div class="button toReal right">还原</div>
	<div class="button toBig right">放大</div>
	<div class="button showRelate right">显示关系</div>
	<div class="button showDetail right show">隐藏详情</div>
	<div class="button showChange right ">隐藏变动</div>
	<!-- <div class="button tablePosition" type="tree">tree布局</div> -->
	<!-- <div class="button tablePosition" type="sortByLayer">schema布局</div> -->
	<div class="button tablePosition" type="dagre">dagre布局</div>
	<div class="button tablePosition" type="sqlflow">sqlflow布局</div>
	<div class="button colorSchema">schema颜色区分</div>
</div>


<div id="uml" style="height: 100%;width: 100%;"  >
	<svg id="svg-canvas" style="height:1px;width:4px; z-index:-10;position: absolute;top:0; left:0;"></svg>
	<div class="content" id="canvas" style="height: 100%;width: 100%; ">
	</div>
</div>
<div id="smmap">
	<div id="mvdiv"></div>
</div>
<!-- JS -->
<jsp:include page="/include/sea.jsp">
	<jsp:param name="jspath" value="/sjzl/jsplumb/js/uml"/>
</jsp:include>