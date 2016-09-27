/**
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 1.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 * 
 * @param maxentries 		总的条目数 *必填*
 * @param current_page		当前选中的页面 可选参数，默认是0，表示显示第1页
 * @param items_per_page	每页显示的条目数 可选参数，默认是10，表示每页10条记录
 * @param callback			回调函数 当点击链接的时候此函数被调用，此函数接受两个参数 current_page, items_per_page
 * 							示例: function(current_page, items_per_page) {} 参数意义同上
 * 
 * 示例：
 * $(selector).pagination({					// $(selector)为一个jquery的DOM对象，示例：$(".pagination")、$("#Pagination")、
 * 		maxentries : maxentries,			// 总的条目数 *必填* 
 * 		current_page: current_page,			// 当前选中的页面 可选参数，默认是0，表示显示第1页
 * 		items_per_page : items_per_page,	// 每页显示的条目数 可选参数，默认是10，表示每页10条记录
 * 		callback : callback					// 回调函数 当点击链接的时候此函数被调用，
 * 											// 此函数接受两个参数 current_page, items_per_page
 * 											// 示例: function(current_page, items_per_page) {} 参数意义同上
 * });
 * 
 * var callback = function(current_page, items_per_page) {
 * 		coding... 
 * 		此处可以包括：
 * 			1.获得数据	从后台或者缓存中获得数据
 * 			2.数据处理	
 * 			3.数据展示	将数据以列表的形式展示在页面中
 * }
 */

define('module/core/page/pagination', function (require, exports, module) {
	jQuery.fn.pagination = function(opts){
	    opts = jQuery.extend({
	    	maxentries : 0,
	        items_per_page:10,
	        current_page : 0,
	        callback:function(){return false;}
	    },opts||{});
	    
	    return this.each(function() {	        
	        //从选项中提取参数
	    	var maxentries = opts.maxentries;
	        var current_page = opts.current_page;
	        var items_per_page = opts.items_per_page;
	        
	        /**
	         * 计算最大分页显示数目
	         */
	        function numPages() {
	            return Math.ceil(maxentries/opts.items_per_page);
	        }    
	        
	        /**
	         * 分页链接事件处理函数
	         * @参数 {int} page_id 为新页码
	         */
	        function pageSelected(page_id, items_per_page, evt){
	            current_page = page_id;
	            drawLinks();
	            var continuePropagation = opts.callback(page_id, items_per_page, panel);
	            if (!continuePropagation) {
	                if (evt.stopPropagation) {
	                    evt.stopPropagation();
	                }
	                else {
	                    evt.cancelBubble = true;
	                }
	            }
	            return continuePropagation;
	        }
	        
	        /**
	         * 此函数将分页链接插入到容器元素中
	         */
	        function drawLinks() {
	            if(maxentries <= items_per_page) {
	            	panel.hide();
	            	return;
	            }
	            panel.show().empty();
	            
	            var begin_index = (current_page)*opts.items_per_page;
	            begin_index = (begin_index==0)?1:begin_index;
	            var end_index = (current_page+1)*opts.items_per_page;
	            end_index = (end_index<=maxentries)?end_index:maxentries;
	            
	            var html = '<div class="status">显示#begin_index#-#end_index#条，共#maxentries#条</div>';
	            panel.append(html.replace("#begin_index#", begin_index)
	            		.replace("#end_index#", end_index)
	            		.replace("#maxentries#", maxentries));
	            
	            var np = numPages();
	            // 这个辅助函数返回一个处理函数调用有着正确page_id的pageSelected。
	            var getClickHandler = function(page_id) {
	                return function(evt){ return pageSelected(page_id, items_per_page, evt); }
	            }
	            
	            var printTag = function(page_id, appendopts) {
	            	page_id = page_id<0?0:(page_id<np-1?page_id:np-1);
	                appendopts = jQuery.extend({tag:"", classes:""}, appendopts||{});
	                if (appendopts.tag == "a") {
	                	var tag = jQuery("<a></a>").addClass(appendopts.classes);
	                	if (page_id != current_page){
		                    var tag = tag.addClass("active")
		                        .bind("click", getClickHandler(page_id));
		                }
	                } else {
	                	var tag = jQuery("<" + appendopts.tag + "></" + appendopts.tag + ">").addClass(appendopts.classes);
	                }
	                return tag;
	            };
	            
	            var $ul = $('<ul class="pages"></ul>');
	            
	            // 产生first
	            // <li><a class="first"></a><a class="prev"></a></li>
	            var $li = $('<li></li>');
	            $li.append(printTag(0, {tag : "a", classes : "first"}));
	            $li.append(printTag(current_page-1, {tag : "a", classes : "prev"}));
	            $ul.append($li);
	            
	            // 产生input
	            // <li>第<input name="" type="text" style="width:40px;" value="1" defaultval="1">页，共12页</li>
	            var $li = $('<li></li>');
	            var $input = $('<input type="text" style="width:40px;" value="' + (current_page+1) + '" defaultval="1" />');
	            $input.change(function(){
	            	panel.attr("pageNum", $(this).val());
	            });
	            $li.append('第 ').append($input).append(' 页，共 ' + np + '页');
	            $ul.append($li);

	            // 产生last
	            // <li><a class="next active"></a><a class="last active"></a><span class="vertical_line"></span></li>
	            $li = $('<li></li>');
	            $li.append(printTag(current_page+1, {tag : "a", classes : "next"}));
	            $li.append(printTag(np-1, {tag : "a", classes : "last"}));
	            $li.append(printTag(0, {tag : "span", classes : "vertical_line"}));
	            $ul.append($li)
	            
	            // 产生select
	            // <li>显示<select name="pagenumber" class="f-w60"><option>10</option><option>20</option></select>条</li>
	            $li = $('<li></li>');
	            var $select = $('<select class="f-w60"></select>')
	            var nums = [5, 10, 20, 30, 50, 100];
	            for (i in nums) {
	            	var n = nums[i];
	            	var $option = $('<option value="' + n + '">' + n +'</option>');
	            	if (n == items_per_page) {
	            		$option.attr("selected", true);
	            	}
	            	$select.append($option);
	            }
	            $select.change(function(){
	            	panel.attr("pageSize", $(this).val());
	            });
	            $li.append('显示 ').append($select).append(' 条');
	            $ul.append($li);
	            
	            // 产生refresh
	            // <li><span class="vertical_line"></span> <a class="refresh"></a></li>
	            $li = $('<li></li>');
	            $li.append(printTag(0, {tag : "span", classes : "vertical_line"}));
	            $a = $('<a class="refresh"></a>').bind("click", function(){
	            	var pageNum = panel.attr("pageNum");
	            	var pageSize = $select.val();
	            	if (pageNum || pageSize){
	            		var reg = /^[0-9]*[1-9][0-9]*$/;
	            		if (reg.test(pageNum) && pageNum<=np) {
	            			current_page = pageNum - 1;
	            		}
	            		if (reg.test(pageSize)) {
	            			opts.items_per_page = pageSize;
	            			if (items_per_page != pageSize) {
	            				items_per_page = pageSize;
	            				opts.current_page = 1;
	            				current_page = 0;
	            			}
	            		}
	            		drawLinks();
	            		opts.callback(current_page, items_per_page);
	            	}
            	});
	            $li.append($a)
	            $ul.append($li);
	            
	            panel.append($ul);
	            
	        }

	        //创建一个显示条数和每页显示条数值
	        maxentries = (!maxentries || maxentries < 0)?1:maxentries;
	        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0)?1:opts.items_per_page;
	        //存储DOM元素，以方便从所有的内部结构中获取
	        var panel = jQuery(this);
	        // 所有初始化完成，绘制链接
	        
	        drawLinks();
	        // 回调函数
	    });
	}
});
