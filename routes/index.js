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
				var str1 = '{"WarningLevel":"' + getXMLNodeValue('WarningLevel', arr[i]) + '","WarningType":"' + getXMLNodeValue('WarningType', arr[i])  + '"}';
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