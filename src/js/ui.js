import { communication } from './communication';

export { ui };

class ui {
	static labels;
	static chartAge;
	static chartApi;
	static chartApiData;
	static chartGender;
	static chartLocations;
	static chartLog;
	static chart(i) {
		communication.get('contact', function (response) {
			var e = ui.q('popup');
			e.innerHTML = '';
			ui.initChartGender(response);
			ui.chartGender.render();
			e.style.transform = e.style.transform && e.style.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)';
		});
	}
	static closeChart() {
		var e = ui.q('popup');
		if (e.style.transform && e.style.transform.indexOf('1') > 0)
			setTimeout(function () {
				e.style.transform = 'scale(0)';
			}, 50);

	}
	static goTo(i) {
		var e = ui.q('navigation item.active');
		if (e)
			e.classList.remove('active');
		ui.closeChart();
		ui.q('navigation item:nth-child(' + i + ')').classList.add('active');
		ui.q('content').style.marginLeft = (-(i - 1) * 100) + '%';
	}
	static init() {
		ui.setLanguage();
		communication.loadMap();
		ui.reposition();
		window.opener.ui.swipe(ui.q('content'), function (dir) {
			if (dir != 'left' && dir != 'right')
				return;
			var i = ui.q('content').style.marginLeft;
			if (!i)
				i = 1;
			else
				i = -parseInt(i) / 100 + 1;
			if (dir == 'right') {
				if (--i < 1)
					return;
			} else {
				if (++i > 3)
					return;
			}
			ui.goTo(i);
		});
	}
	static initChartGender(data) {
		var total = [0, 0, 0, 0], verified = [0, 0, 0, 0], withImage = [0, 0, 0, 0], genderMap = [2, 1, 3, null];
		for (var i = 0; i < data.length; i++) {
			var x = data[i]._count / 1000;
			for (var i2 = 0; i2 < genderMap.length; i2++) {
				if (data[i].gender == genderMap[i2]) {
					total[i2] += x;
					if (data[i].verified)
						verified[i2] += x;
					if (data[i]._image)
						withImage[i2] += x;
				}
			}
		}
		for (var i = 0; i < total.length; i++) {
			total[i] = (parseInt(total[i] * 10 + 0.5) / 10);
			verified[i] = (parseInt(verified[i] * 10 + 0.5) / 10);
			withImage[i] = (parseInt(withImage[i] * 10 + 0.5) / 10);
		}
		if (ui.chartGender)
			ui.chartGender.destroy();
		ui.chartGender = new ApexCharts(ui.q('popup'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			plotOptions: {
				bar: {
					horizontal: true
				}
			},
			dataLabels: {
				enabled: true,
				textAnchor: 'start',
				formatter: function (val, opt) {
					return val + '%'
				},
				offsetX: 0,
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.total,
				data: total
			},
			{
				name: ui.labels.verified,
				data: verified
			},
			{
				name: ui.labels.withImage,
				data: withImage
			}],
			labels: [ui.labels.female, ui.labels.male, ui.labels.divers, ui.labels.noData]
		});
	}
	static initChartAge(data) {
		var index = {}, female = [0, 0, 0, 0, 0, 0, 0], male = [0, 0, 0, 0, 0, 0, 0], divers = [0, 0, 0, 0, 0, 0, 0], noData = [0, 0, 0, 0, 0, 0, 0];
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		for (var i = 1; i < data.length; i++) {
			var x = data[i][index['_count']] / 1000, i2;
			if (data[i][index['_age']] == null)
				i2 = male.length - 1;
			else
				i2 = data[i][index['_age']] - 1;
			if (i2 < 0)
				i2 = 0;
			else if (i2 > male.length - 1)
				i2 = male.length - 1;
			if (data[i][index['contact.gender']] == 1)
				male[i2] += x;
			else if (data[i][index['contact.gender']] == 2)
				female[i2] += x;
			else if (data[i][index['contact.gender']] == 3)
				divers[i2] += x;
			else
				noData[i2] += x;
		}
		for (var i = 0; i < female.length; i++) {
			female[i] = parseInt(0.5 + female[i]);
			male[i] = parseInt(0.5 + male[i]);
			divers[i] = parseInt(0.5 + divers[i]);
			noData[i] = parseInt(0.5 + noData[i]);
		}
		if (ui.chartAge) {
			ui.chartAge.destroy();
			ui.q('chart.age').innerHTML = '';
		}
		ui.chartAge = new ApexCharts(ui.q('chart.age'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			dataLabels: {
				formatter: function (val, opt) {
					return val + '%'
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.female,
				data: female
			},
			{
				name: ui.labels.male,
				data: male
			},
			{
				name: ui.labels.divers,
				data: divers
			},
			{
				name: ui.labels.noData,
				data: noData
			}],
			labels: [ui.labels.until + ' 20', '20-30', '30-40', '40-50', '50-60', ui.labels.from + ' 60', ui.labels.noData]
		});
		setTimeout(function () {
			ui.q('chart.age').innerHTML = '';
			ui.chartAge.render();
		}, 400);
	}
	static initChartApi(data) {
		var index = {};
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		ui.chartApiData = [];
		var labels = [], values = [];
		for (var i = 1; i < data.length; i++) {
			if (data[i][index['_percentage']] >= 0.005) {
				values.push(parseInt('' + (data[i][index['_percentage']] * 100 + 0.5)));
				labels.push(data[i][index['_label']]);
				ui.chartApiData.push(data[i]);
			}
		}
		if (ui.chartApi) {
			ui.chartApi.destroy();
			ui.q('chart.api').innerHTML = '';
		}
		ui.chartApi = new ApexCharts(ui.q('chart.api'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return ui.labels.calls.replace('{0}', value).replace('{1}', parseInt(ui.chartApiData[dataPointIndex][index['_time']] + 0.5));
					}
				}
			},
			series: [{
				name: '',
				data: values
			}],
			labels: labels
		});
		setTimeout(function () {
			ui.q('chart.api').innerHTML = '';
			ui.chartApi.render();
		}, 400);
	}
	static initChartLocations(data) {
		var index = {};
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		var l = [], series = [
			{ name: ui.labels.category0, data: [] },
			{ name: ui.labels.category1, data: [] },
			{ name: ui.labels.category2, data: [] },
			{ name: ui.labels.category3, data: [] },
			{ name: ui.labels.category4, data: [] },
			{ name: ui.labels.category5, data: [] }
		];
		for (var i = 1; i < data.length; i++) {
			var category = parseInt(data[i][index['location.category']]);
			var town = data[i][index['location.town']];
			var e = null;
			for (var i2 = 0; i2 < l.length; i2++) {
				if (l[i2].town == town) {
					e = l[i2];
					break;
				}
			}
			if (!e) {
				e = { total: 0, town: town };
				l.push(e);
			}
			e[category] = data[i][index['_c']] / 10;
			e.total += e[category];
		}
		l.sort(function (a, b) { return a.total < b.total ? 1 : -1 });
		var labels = [];
		for (var i = 0; i < Math.min(10, l.length); i++) {
			for (var i2 = 0; i2 < series.length; i2++)
				series[i2].data.push(l[i][i2] ? l[i][i2] : 0);
			labels.push(l[i].town);
		}
		if (ui.chartLocations) {
			ui.chartLocations.destroy();
			ui.q('chart.locations').innerHTML = '';
		}
		ui.chartLocations = new ApexCharts(ui.q('chart.locations'), {
			chart: {
				type: 'bar',
				stacked: true,
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: series,
			labels: labels
		});
		setTimeout(function () {
			ui.q('chart.locations').innerHTML = '';
			ui.chartLocations.render();
		}, 400);
	}
	static initChartLog(data) {
		var index = {};
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		var labels = [], values = [];
		for (var i = 1; i < data.length; i++) {
			if (data[i][index['_time']] > -1) {
				values.push(parseInt('' + (data[i][index['_count']] * 100 + 0.5)));
				labels.push((i == data.length - 1 ? ui.labels.from + ' ' : '') + (data[i][index['_time']] * 20));
			}
		}
		if (ui.chartLog) {
			ui.chartLog.destroy();
			ui.q('chart.log').innerHTML = '';
		}
		ui.chartLog = new ApexCharts(ui.q('chart.log'), {
			chart: {
				type: 'line',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.responseTime,
				data: values
			}],
			labels: labels
		});
		setTimeout(function () {
			ui.q('chart.log').innerHTML = '';
			ui.chartLog.render();
		}, 400);
	}
	static q(path) {
		return document.querySelector(path);
	}
	static qa(path) {
		return document.querySelectorAll(path);
	}
	static on(e, type, f, once) {
		e.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
	}
	static reposition() {
		var e = ui.q('main').style;
		e.width = window.opener.ui.q('main').style.width;
		e.marginLeft = (-parseFloat(e.width) / 2) + 'px';
		if (window.opener.global.getDevice() == 'computer') {
			e.left = '';
			e.right = '';
		} else {
			e.left = 0;
			e.right = 0;
		}
		ui.q('body').style.fontSize = window.opener.ui.q('body').style.fontSize;
	}
	static setLanguage() {
		communication.language(opener.global.language, function (response) {
			var e = ui.qa('[l]');
			ui.labels = response;
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.labels[e[i].getAttribute('l')];
		});
	}
}