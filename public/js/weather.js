$(function() {
	var $modal = $('#my-modal-loading');
	$modal.modal();
	$modal.modal('close');
	//alert("气象局服务器连接失败！请稍后再访问！");
	$.ajax({
		type: "get",
		url: hosts + "/BsReal",
		timeout: 3000,
		success: function(data) {
			if (!data) {
				//alert('服务器连接失败！');
				$modal.modal('close');
				return false;
			}
			$('#Temperature').html(data.Temperature + '<span>℃</span>');
			$('#CollectDate').html(data.CollectDate);
			$('#Rain_sum_60').html('降水：' + data.Rain_sum_60);
			$('#RelativeHumidity').html('相对湿度：' + data.RelativeHumidity + ' %');
			$('#WindSpeed').html('风速：' + data.WindSpeed + ' m/s');
			$('#Visibility').html('能见度：' + data.Visibility + ' 米');
			$('#AirPressure').html('气压：' + data.AirPressure);
			$.ajax({
				type: "get",
				url: hosts + "/Bs7Day",
				success: function(data) {
					var _list = '';
					for (var i in data) {
						_list += '<li>';
						_list += '<p>' + data[i].Date + '</p>';
						_list += '<p>' + data[i].DayWeather + '</p>';
						_list += '<p class="p_bottom">' + data[i].TempMin + "~" + data[i].TempMax + '℃</p>';
						_list += '</li>';
					}
					$('#10day').html(_list);
					$.ajax({
						type: "get",
						url: hosts + "/BsWarn",
						success: function(data) {
							var _list = '';
							for (var i in data) {
								_list += '<h3>' + data[i].WarningLevel + data[i].WarningType + '预警</h3>';
							}
							$('#warn').html(_list);
							$modal.modal('close');
						}
					});
				}
			});
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				//ajaxTimeoutTest.abort();　　　　　
				alert('气象局服务器连接失败！请稍后再访问！');　　　
			}　　
		}
	});

});