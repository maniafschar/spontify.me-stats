import { communication } from "./communication";
import { ui } from "./ui";

export { heatmap }

class heatmap {
	static map;

	static init() {
		communication.get('statistics/contact/location', function (l) {
			var points = [], n = 10000, w = 10000, s = -10000, e = -10000;
			for (var i = 0; i < l.length; i++) {
				points.push(new google.maps.LatLng(l[i][0], l[i][1]));
				if (n > l[i][0])
					n = l[i][0];
				if (s < l[i][0])
					s = l[i][0];
				if (w > l[i][1])
					w = l[i][1];
				if (e < l[i][1])
					e = l[i][1];
			}
			heatmap.map = new google.maps.Map(ui.q('mapCanvas'), {
				center: { lat: 48.1, lng: 11.6 },
				zoom: 5,
				mapTypeId: google.maps.MapTypeId.SATELLITE
			});
			new google.maps.visualization.HeatmapLayer({
				data: points,
				map: heatmap.map,
				dissipating: true,
				maxIntensity: 10
			});
		});
	}
}