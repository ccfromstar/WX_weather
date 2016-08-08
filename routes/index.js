var settings = require('../settings');
var mysql = require('../models/db');
var async = require('async');
var debug = require('debug')('myapp:index');
var ejsExcel = require("./ejsExcel");
var fs = require("fs");
var formidable = require('formidable');
var request = require("request");
var crypto = require("crypto");
var Iconv = require('iconv-lite');

exports.BsReal = function(req, res) {
	request({
		url: settings.serviceIP + 'BsReal',
		method: 'POST'
	}, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			var result = {
				Temperature: getXMLNodeValue('Temperature', body),
				CollectDate: getXMLNodeValue('CollectDate', body),
				Rain_sum_60: getXMLNodeValue('Rain_sum_60', body),
				WindDirection: getXMLNodeValue('WindDirection', body),
				WindSpeed: getXMLNodeValue('WindSpeed', body),
				AirPressure: getXMLNodeValue('AirPressure', body),
				RelativeHumidity: getXMLNodeValue('RelativeHumidity', body),
				Visibility: getXMLNodeValue('Visibility', body)
			};
		}
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(result);
	});
}

exports.Bs7Day = function(req, res) {
	request({
		url: settings.serviceIP + 'Bs7Day',
		method: 'POST'
	}, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			var arr = body.split('rowOrder');
			var result = '[';
			for (var i = 1; i < arr.length; i++) {
				var str1 = '{"Date":"' + getXMLNodeValue('Date', arr[i]) + '","DayWeather":"' + getXMLNodeValue('DayWeather', arr[i]) + '","TempMin":"' + getXMLNodeValue('TempMin', arr[i]) + '","TempMax":"' + getXMLNodeValue('TempMax', arr[i]) + '"}';
				if (i == (arr.length - 1)) {
					result += str1;
				} else {
					result += str1 + ',';
				}
			}
			result += ']';
		}
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(JSON.parse(result));
	});
}

exports.BsWarn = function(req, res) {
	request({
		url: settings.serviceIP + 'BsWarn',
		method: 'POST'
	}, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			var arr = body.split('rowOrder');
			var result = '[';
			for (var i = 1; i < arr.length; i++) {
				var str1 = '{"WarningLevel":"' + getXMLNodeValue('WarningLevel', arr[i]) + '","WarningType":"' + getXMLNodeValue('WarningType', arr[i]) + '"}';
				if (i == (arr.length - 1)) {
					result += str1;
				} else {
					result += str1 + ',';
				}
			}
			result += ']';
		}
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(JSON.parse(result));
	});
}

exports.GetCruiseRowsTwoAction = function(req, res) {
	request({
		url: settings.bsqxIP + '?month=' + req.query.month + '&day=' + req.query.day,
		method: 'GET'
	}, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.send(JSON.parse(body));
		}
	});
}

exports.City15Day = function(req, res) {
	var namepinying = req.query.namepinying;
	var start_date = req.query.start_date;
	var arr1 = namepinying.split(',');
	var nextDay = start_date;
	var weather_list = '';
	async.eachSeries(arr1, function(record, callback) {
		request({
			url: settings.serviceIP + 'City15Day',
			method: 'POST',
			form: {
				City: record
			}
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {

				var arr_1 = body.split("<ForecastDate>" + nextDay);
				if (arr_1[1]) {
					var arr_2 = arr_1[1].split("</City>");
					//console.log(getXMLNodeValue('MinTemp', arr_2[0]));
					//console.log(getXMLNodeValue('MaxTemp', arr_2[0]));
					//console.log(getXMLNodeValue('Weather', arr_2[0]));
					//arr_2[0] = arr_2[0].replace(/g-9999.9/,'-');
					var mintemp = getXMLNodeValue('MinTemp', arr_2[0]);
					var maxtemp = getXMLNodeValue('MaxTemp', arr_2[0]);

					if (mintemp == '-9999.9' || maxtemp == '-9999.9') {
						if (weather_list == "") {
							weather_list = "-";
						} else {
							weather_list = weather_list + ";-";
						}
					} else {
						if (weather_list == "") {

							weather_list = getXMLNodeValue('MinTemp', arr_2[0]) + "℃~" + getXMLNodeValue('MaxTemp', arr_2[0]) + "℃<br/>" + getXMLNodeValue('Weather', arr_2[0]);
						} else {
							weather_list = weather_list + ";" + getXMLNodeValue('MinTemp', arr_2[0]) + "℃~" + getXMLNodeValue('MaxTemp', arr_2[0]) + "℃<br/>" + getXMLNodeValue('Weather', arr_2[0]);
						}
					}
				} else {
					if (weather_list == "") {
						weather_list = "-";
					} else {
						weather_list = weather_list + ";-";
					}
				}
				nextDay = getNextDay(nextDay);
				callback(err, response);
			}
		});
	}, function(err) {
		if (err) return console.error(err.stack);
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(weather_list);
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

function getXMLNodeValue(node_name, xml) {
	var tmp = xml.split("<" + node_name + ">");
	var _tmp = tmp[1].split("</" + node_name + ">");
	return _tmp[0].replace(/[\n]/ig, '');
}

Date.prototype.Format = function(fmt) {
	var d = this;
	var o = {
		"M+": d.getMonth() + 1, //月份
		"d+": d.getDate(), //日
		"h+": d.getHours(), //小时
		"m+": d.getMinutes(), //分
		"s+": d.getSeconds(), //秒
		"q+": Math.floor((d.getMonth() + 3) / 3), //季度
		"S": d.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}