import { charts } from './charts';
import { communication } from './communication';
import { marketing } from './marketing';

export { ui };

class ui {
	static labels;
	static open(index) {
		var e = ui.q('popup').style;
		if (e.transform && e.transform.indexOf('1') > 0) {
			e.transform = 'scale(0)';
			return;
		}
		var s = '', map = {
			button1: ['User', 'Log'],
			button2: ['Login', 'Age'],
			button3: ['Api', 'Locations']
		};
		var exec = function (chartToken) {
			communication.get('statistics/contact/' + chartToken, function (response) {
				charts.initChart(chartToken, response);
			});
			return chartToken.toLowerCase();
		}
		for (var i = 0; i < map['button' + index].length; i++)
			s += '<chart class="' + exec(map['button' + index][i]) + '"></chart>';
		ui.q('popup panel').innerHTML = '<div>' + s + '</div>';
		e.transform = 'scale(1)';
	}
	static close() {
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
		ui.close();
		ui.q('navigation item:nth-child(' + i + ')').classList.add('active');
		ui.q('content').style.marginLeft = (-(i - 1) * 100) + '%';
		if (i == 2)
			marketing.init();
	}
	static init() {
		ui.setLanguage();
		//communication.loadMap();
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