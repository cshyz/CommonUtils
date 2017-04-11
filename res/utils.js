/**
 * 前端通用工具类
 */
$.namespace("common.utils");
common.utils = function() {
	return {
		// 通用Ajax方法 - 所有Ajax请求使用此方法
		ajax : function (href, data, callback) {
			if (!callback) {
				callback = data;
				data = {};
			}
			
			data = typeof data === 'string' ? data : JSON.stringify(data);
			
			$.ajax({
				type : "POST",
				contentType : "application/json",
				url : CONTEXT_PATH + href,
				data : data,
				dataType : "json",
				success : function(data) {
					callback(data);
				},
				error : function(data, status, e) {
					if (data.status == 404 || data.status == "404") {
						alert("可能是电脑断网了，也可能是服务器出毛病了，请重新尝试。");
					} else if (data.status == 500 || data.status == "500") {
						alert("服务器内部错误，请重新尝试。");
					} else if(data.status == 401 || data.status == "401"){
						alert("鉴权未成功，所请求的功能无法使用。");
					} else {
						alert("未知错误，请联系管理员。");
					}
				}
			});
		},
		
		isEmpty : function(obj) {
    		return (obj == null || obj == '' || obj == undefined
    				|| typeof (obj) == 'undefined' || 'null' == obj);
    	},
		
    	isNotEmpty : function(obj) {
    		return !this.isEmpty(obj);
    	},
		
    	isBlank : function(obj) {
    		return this.isEmpty(obj) ? true : this.isEmpty(obj.trim());
    	},
		
    	isNotBlank : function(obj) {
    		return !this.isBlank(obj);
    	},
	    
	    // 列表头部渲染
	    renderTableHead : function($table, table_head_list) {
	    	var $thead = $("thead", $table).empty();
	    	var $tr = $("<tr></tr>").appendTo($thead);
	    	$.each(table_head_list, function() {
	    		$tr.append($("<th>" + this + "</th>"));
	    	});
	    	return $thead;
	    },
	    
	    // 列表数据渲染
	    renderTableBody : function($table, table_field_list, table_data_list) {
	    	var pattern = new RegExp("\\{(.| )+?\\}","igm");
	    	var $tbody = $("tbody", $table).empty();
	    	$.each(table_data_list, function(i, row_data) {
	    		var $tr = $("<tr></tr>").appendTo($tbody);
	    		$.each(table_field_list, function(j, field) {// 数据添加
	    			var matched = field.match(pattern);
	    			if (common.utils.isNotEmpty(matched)) {// 操作列
	    				var control = field;
	    				$.each(matched, function(k, mat) {
	    					control = control.replace(mat, row_data[mat.substring(1, mat.length-1)]);
	    				});
	    				$tr.append($("<td>" + control + "</td>"));
	    			} else {// 数据列
	    				var data = row_data[field];
	    				data = common.utils.isEmpty(data) ? "" : data;
	    				$tr.append($("<td>" + data + "</td>"));
	    			}
    			});
	    	});
	    	return $tbody;
	    },
	}
}();

/**
 * 重置Modal
 */
$(".modal[role='dialog']").on("hide.bs.modal", function() {
	$.each($("form", $(this)), function(i, form){form.reset();});
	$("input:hidden", $(this)).removeAttr('value');
	
	// 解决 显示两个modal时 底层modal滚动条丢失问题
	$('.modal').css({'overflow-y':'auto'});
});
