import { ui } from "./ui";

export { charts };

class charts {
	static chartAge;
	static chartApi;
	static chartApiData;
	static chartGender;
	static chartLocations;
	static chartLog;

	static initChart(query, data) {
		ui.q('popup panel').innerHTML = '';
		charts['initChart' + query](data);
	}
	static initChartUser(data) {
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
		if (charts.chartGender)
			charts.chartGender.destroy();
		charts.chartGender = new ApexCharts(ui.q('popup panel'), {
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
		charts.chartGender.render();
	}
	static initChartAge(data) {
		var female = [0, 0, 0, 0, 0, 0, 0], male = [0, 0, 0, 0, 0, 0, 0], divers = [0, 0, 0, 0, 0, 0, 0], noData = [0, 0, 0, 0, 0, 0, 0];
		for (var i = 0; i < data.length; i++) {
			var x = data[i]._count / 1000, i2;
			if (data[i]._age == null)
				i2 = male.length - 1;
			else
				i2 = data[i]._age - 1;
			if (i2 < 0)
				i2 = 0;
			else if (i2 > male.length - 1)
				i2 = male.length - 1;
			if (data[i].contact.gender == 1)
				male[i2] += x;
			else if (data[i].contact.gender == 2)
				female[i2] += x;
			else if (data[i].contact.gender == 3)
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
		if (charts.chartAge)
			charts.chartAge.destroy();
		charts.chartAge = new ApexCharts(ui.q('popup panel'), {
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
			charts.chartAge.render();
		}, 400);
	}
	static initChartApi(data) {
		charts.chartApiData = [];
		var labels = [], values = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i]._percentage >= 0.005) {
				values.push(parseInt('' + (data[i]._percentage * 100 + 0.5)));
				labels.push(data[i]._label);
				charts.chartApiData.push(data[i]);
			}
		}
		if (charts.chartApi)
			charts.chartApi.destroy();
		charts.chartApi = new ApexCharts(ui.q('popup panel'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return ui.labels.calls.replace('{0}', value).replace('{1}', parseInt(charts.chartApiData[dataPointIndex]._time + 0.5));
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
			charts.chartApi.render();
		}, 400);
	}
	static initChartLocations(data) {
		var l = [], series = [
			{ name: ui.labels.category0, data: [] },
			{ name: ui.labels.category1, data: [] },
			{ name: ui.labels.category2, data: [] },
			{ name: ui.labels.category3, data: [] },
			{ name: ui.labels.category4, data: [] },
			{ name: ui.labels.category5, data: [] }
		];
		for (var i = 1; i < data.length; i++) {
			var category = parseInt(data[i].location.category);
			var town = data[i].location.town;
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
			e[category] = data[i]._c / 10;
			e.total += e[category];
		}
		l.sort(function (a, b) { return a.total < b.total ? 1 : -1 });
		var labels = [];
		for (var i = 0; i < Math.min(10, l.length); i++) {
			for (var i2 = 0; i2 < series.length; i2++)
				series[i2].data.push(l[i][i2] ? l[i][i2] : 0);
			labels.push(l[i].town);
		}
		if (charts.chartLocations) {
			charts.chartLocations.destroy();
			ui.q('chart.locations').innerHTML = '';
		}
		charts.chartLocations = new ApexCharts(ui.q('popup panel'), {
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
			charts.chartLocations.render();
		}, 400);
	}
	static initChartLog(data) {
		var labels = [], values = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i]._time > -1) {
				values.push(parseInt('' + (data[i]._count * 100 + 0.5)));
				labels.push((i == data.length - 1 ? ui.labels.from + ' ' : '') + (data[i]._time * 20));
			}
		}
		if (charts.chartLog) {
			charts.chartLog.destroy();
			ui.q('chart.log').innerHTML = '';
		}
		charts.chartLog = new ApexCharts(ui.q('popup panel'), {
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
			charts.chartLog.render();
		}, 400);
	}

}