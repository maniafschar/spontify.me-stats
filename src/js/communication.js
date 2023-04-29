import { heatmap } from "./heatmap";

export { communication }

class communication {
	static get(type, callback) {
		window.opener.communication.ajax({
			url: window.opener.global.serverApi + 'statistics/' + type,
			responseType: 'json',
			webCall: 'communication.get(type,callback)',
			success(response) {
				var list = [];
				for (var i = 1; i < response.length; i++)
					list.push(window.opener.model.convert(type, response, i));
				callback(list);
			}
		});
	}
	static language(language, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status >= 200 && xmlhttp.status < 300)
					callback(JSON.parse(xmlhttp.responseText));
			}
		};
		xmlhttp.open('GET', 'js/lang/stats' + language + '.json', true);
		xmlhttp.send();
	}
	static loadMap() {
		window.opener.communication.ajax({
			url: window.opener.global.serverApi + 'action/google?param=js',
			responseType: 'text',
			webCall: 'communication.loadMap()',
			success(r) {
				var script = document.createElement('script');
				script.src = r + '&libraries=visualization&callback=heatmap.init';
				document.head.appendChild(script);
			}
		});
	}
}
