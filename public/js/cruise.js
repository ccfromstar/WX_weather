$(function() {
	$('#start_date').datepicker('setValue', getToday());

	$('#c_search').bind('click', function() {
		getList();
	});

	getList();
});

function getList() {
	var dat = $('#start_date').val();
	var arr1 = dat.split('-');
	var $modal = $('#my-modal-loading');
	$modal.modal();
	$.ajax({
		type: "get",
		url: hosts + "/GetCruiseRowsTwoAction?month=" + Number(arr1[1]) + "&day=" + Number(arr1[2]) + "&fulldate=" + dat,
		success: function(data) {
			var _list = '';
			for (var i in data) {
				_list += '<li onclick="getCruiseLine(' + i + ')">';
				_list += data[i].ships;
				_list += '</li>';
			}
			$('#c_list').html(_list);
			if(_list){
				getCruiseLine(0);
			}else{
				$('#c_line').html('');
				var $modal = $('#my-modal-loading');
				$modal.modal('close');
			}
		}
	});
}

function getNextDay(d) {
	d = new Date(d);
	d = +d + 1000 * 60 * 60 * 24;
	var myDate = new Date(d);
	var y = myDate.getFullYear();
	var m = (((myDate.getMonth() + 1) + "").length == 1) ? "0" + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
	var d = (((myDate.getDate()) + "").length == 1) ? "0" + (myDate.getDate()) : (myDate.getDate());

	return y + "-" + m + "-" + d;
}

function getCruiseLine(i) {
	var $modal = $('#my-modal-loading');
	$modal.modal();
	var dat = $('#start_date').val();
	var arr1 = dat.split('-');
	$.ajax({
		type: "get",
		url: hosts + "/GetCruiseRowsTwoAction?month=" + Number(arr1[1]) + "&day=" + Number(arr1[2]) + "&fulldate=" + dat,
		success: function(data) {
			//获取天气信息
			$.ajax({
				type: "get",
				url: hosts + "/City15Day?namepinying=" + data[i].namepinying + "&start_date=" + dat,
				success: function(data1) {
					var arr3 = data1.split(";");
					var _list = '<table id="t_line" class="am-table am-table-striped am-table-hover"><thead><tr><th>天数</th><th>日期</th><th>目的地</th><th>天气</th></tr></thead>';
					var data_line = data[i].name;
					var arr2 = data_line.split(',');
					var nextDay = dat;
					for (var j = 0; j < arr2.length; j++) {
						_list += '<tr>';
						_list += '<td>' + (j + 1) + '</td>';
						_list += '<td>' + nextDay + '</td>';
						_list += '<td>' + arr2[j] + '</td>';
						_list += '<td>' + arr3[j] + '</td>';
						_list += '</tr>';
						nextDay = getNextDay(nextDay);
					}
					_list += '</table>';
					$('#c_line').html(_list);
					//设置邮轮选中效果
					$('#c_list').find('li').css('color', '#fff');
					$('#c_list').find('li').eq(i).css('color', '#E0690C');
					var $modal = $('#my-modal-loading');
					$modal.modal('close');
				}
			});
		}
	});
}

function getToday() {
	var myDate = new Date();
	var y = myDate.getFullYear();
	var m = (((myDate.getMonth() + 1) + "").length == 1) ? "0" + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
	var d = (((myDate.getDate()) + "").length == 1) ? "0" + (myDate.getDate()) : (myDate.getDate());
	return y + "-" + m + "-" + d;
}