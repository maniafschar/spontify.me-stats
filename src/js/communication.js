export { communication }

class communication {
	static convert(type, callback) {
	}
	static get(type, callback) {
		window.opener.communication.ajax({
			url: window.opener.global.serverApi + 'statistics/' + type,
			responseType: 'json',
			webCall: 'communication.get(type,callback)',
			success(response) {
				var list = [];
				for (var i = 1; i < response.length; i++)
					list.push(window.opener.model.convert('contact', response, i));
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
}
