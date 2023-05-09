import { communication2 } from "./communication2";
import { ui2 } from "./ui2";

export { marketing }

class marketing {
	static data;
	static templateEdit = v =>
		window.global.template`<fieldset${v.disabled}>
<input type="hidden" name="id" value="${v.id}" />
<field>
	<label>Zeitraum</label>
	<value class="marketingPeriod">
		<input name="startDate" placeholder="TT.MM.JJJJ" type="date" value="${v.startDate}"></input>
		<input name="endDate" placeholder="TT.MM.JJJJ" type="date" value="${v.endDate}"></input>
		<explain>Achtung: Nach Beginn der Umfrage sind die Daten hier nicht mehr änderbar.</explain>
	</value>
</field>
<field>
	<label>Sprache</label>
	<value>
		<input type="radio" name="language" value="DE" label="Deutsch" ${v.language == 'DE' ? ' checked' : ''}></input>
		<input type="radio" name="language" value="EN" label="Englisch" ${v.language == 'EN' ? ' checked' : ''}></input>
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		<input type="checkbox" name="gender" value="2" label="${ui.l('female')}" ${v.gender && v.gender.indexOf(2) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="1" label="${ui.l('male')}" ${v.gender && v.gender.indexOf(1) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="3" label="${ui.l('divers')}" ${v.gender && v.gender.indexOf(3) > -1 ? ' checked' : ''} />
	</value>
</field>
<field>
	<label>Alter</label>
	<value style="height:4em;">
		<input type="text" id="age" slider="range" min="18" max="99" name="age" value="${v.age}"/>
	</value>
</value>
</field>
<field>
	<label>Region</label>
	<value>
		<input name="region" value="${v.region}"/>
		<explain>2 stelliges Länderkürzel und/oder die ersten Stellen der Postleitzahlen und/oder Städte, z.B.<br />CH DE-8 Nürnberg Hamburg</explain>
	</value>
</field>
<field>
	<label>Ergebnis</label>
	<value>
		<input type="checkbox" name="share" value="${v.share}" label="auf soziale Netzwerke veröffentlichen"/>
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value><textarea name="prolog">${v.storage.prolog}</textarea></value>
</field>
<questions>${marketing.templateQuestion(v.storage.questions ? v.storage.questions[0] : {})}</questions>
<field>
	<label>Schlusswort</label>
	<value><textarea name="epilog">${v.storage.epilog}</textarea></value>
</field>
<br />
<buttontext class="bgColor${v.hideSave}" onclick="marketing.test()">Test</buttontext>
<buttontext class="bgColor${v.hideSave}" onclick="marketing.save()">${ui.l('save')}</buttontext>
</fieldset>`;
	static templateQuestion = v =>
		window.global.template`<field>
	<label>Frage ${v.index ? v.index : 1}</label>
	<value><input name="question" onblur="marketing.addQuestion(this)" value="${v.question}"></input></value>
	<label>Antworten</label>
	<value${v.answerType ? ' class="multiSelect"' : ''}>
		${marketing.templateAnswer(v.answers ? v.answers[0] : {})}
		<input type="checkbox" name="textField" value="1" ${v.textField ? ' checked' : ''} label="Freitextfeld"></input>
		<input type="checkbox" onclick="marketing.toggleAnswerType(event)" name="answerType" value="1" ${v.answerType ? ' checked' : ''} label="Mehrfachauswahl" class="answerMultiSelect"></input>
	</value>
</field>`;
	static templateAnswer = v =>
		window.global.template`<answer>
<input name="answer" onblur="marketing.addAnswer(this)" value="${v.answer}"></input>
<select name="next">${v.nextOptions}</select>
</answer>`;
	static templateList = v =>
		window.global.template`<row onclick="marketing.edit(${v.id})">
	<div>
		${v.storage.prolog}<br />
		${v.storage.questions[0].question}<br />
		${v.storage.epilog}
		<buttontext class="bgColor${v.started ? '' : ' hidden'}" onclick="marketing.results(event,${v.id})">Auswertung</buttontext>
	</div>
</row>`;
	static templateResults = v =>
		window.global.template`<field>
	<label>Zeitraum</label>
	<value>
		${v.startDate} - ${v.endDate}
	</value>
</field>
<field>
	<label>Sprache</label>
	<value>
		${v.language}
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		${v.gender && v.gender.indexOf(2) > -1 ? ui.l('female') : ''}
		${v.gender && v.gender.indexOf(1) > -1 ? ui.l('male') : ''}
		${v.gender && v.gender.indexOf(3) > -1 ? ui.l('divers') : ''}
	</value>
</field>
<field>
	<label>Alter</label>
	<value>
		${v.age}
	</value>
</value>
</field>
<field>
	<label>Region</label>
	<value>
		${v.region}
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value>
		${v.storage.prolog}
	</value>
</field>
<field>
	<label>Schlusswort</label>
	<value>
		${v.storage.epilog}
	</value>
</field>
<field>
	<label>Teilnehmer</label>
	<value>
		${v.participants}
	</value>
</field>
<results>${v.answers}</results>`;
	static addAnswer(e) {
		if (e.value && e.parentElement.nextElementSibling.nodeName != e.parentElement.nodeName) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateAnswer({});
			e.parentElement.parentElement.insertBefore(e2.children[0], e.parentElement.nextElementSibling);
		}
	}
	static addQuestion(e) {
		if (e.value && e.parentElement.parentElement.parentElement.lastElementChild == e.parentElement.parentElement) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateQuestion({ index: ui.qa('main.statistics questions>field').length + 1 });
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static edit(id) {
		var e = ui.q('main.statistics popup').style;
		if (e.transform && e.transform.indexOf('1') > 0) {
			e.transform = 'scale(0)';
			return;
		}
		var v;
		if (id) {
			for (var i = 0; i < marketing.data.length; i++) {
				if (id == marketing.data[i].id) {
					v = marketing.data[i];
					break;
				}
			}
		}
		if (!v) {
			var max = 0;
			for (var i = 0; i < marketing.data.length; i++) {
				if (marketing.data[i].id > max)
					max = marketing.data[i].id;
			}
			v = { id: max + 1, language: window.global.language, storage: {} };
		}
		if (v.startDate && window.global.date.server2local(v.startDate) < new Date()) {
			v.disabled = ' disabled';
			v.hideSave = ' hidden';
		}
		ui.q('main.statistics popup panel').innerHTML = marketing.templateEdit(v);
		e.transform = 'scale(1)';
		if (v.storage.questions) {
			for (var i = 0; i < v.storage.questions.length; i++) {
				if (i > 0) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateQuestion({ index: i + 1, ...v.storage.questions[i] });
					ui.q('main.statistics popup questions').appendChild(e2.children[0]);
				}
				for (var i2 = 1; i2 < v.storage.questions[i].answers.length; i2++) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateAnswer(v.storage.questions[i].answers[i2]);
					var e3 = ui.qa('main.statistics popup questions>field:nth-child(' + (i + 1) + ')>value')[1];
					e3.insertBefore(e2.children[0], e3.querySelector('input[type="checkbox"]'));
				}
			}
		}
		formFunc.initFields(ui.q('main.statistics popup panel'));
	}
	static html2json() {
		var e = ui.qa('main.statistics questions field'), o = {};
		var read = function (label, o) {
			var e2 = ui.q('main.statistics popup [name="' + label + '"]');
			if (e2.type == 'checkbox' || e2.type == 'radio') {
				e2 = ui.qa('main.statistics popup [name="' + label + '"]:checked');
				var s = '';
				for (var i = 0; i < e2.length; i++)
					s += e2[i].value;
				o[label] = s;
			} else if (e2.value)
				o[label] = e2.value;
		}
		read('id', o);
		read('language', o);
		read('startDate', o);
		read('endDate', o);
		read('gender', o);
		read('age', o);
		read('region', o);
		read('share', o);
		var storage = { questions: [] };
		read('prolog', storage);
		read('epilog', storage);
		for (var i = 0; i < e.length; i++) {
			if (e[i].querySelector('input[name="question"]').value) {
				var q = {
					question: e[i].querySelector('input[name="question"]').value,
					answerType: e[i].querySelector('input[name="answerType"]').checked,
					textField: e[i].querySelector('input[name="textField"]').checked,
					answers: []
				};
				var answers = e[i].querySelectorAll('answer');
				for (var i2 = 0; i2 < answers.length; i2++) {
					if (answers[i2].querySelector('input').value) {
						q.answers.push({
							answer: answers[i2].querySelector('input').value,
							next: answers[i2].querySelector('select').value
						});
					}
				}
				storage.questions.push(q);
			}
		}
		o.storage = JSON.stringify(storage);
		return o;
	}
	static init() {
		if (!ui.q('main.statistics marketing list').innerHTML) {
			communication2.get('statistics/marketing', function (r) {
				marketing.data = r;
				var s = '';
				for (var i = 0; i < r.length; i++) {
					r[i].storage = JSON.parse(r[i].storage);
					if (r[i].startDate && window.global.date.server2local(r[i].startDate) < new Date())
						r[i].started = true;
					s += marketing.templateList(r[i]);
				}
				ui.q('main.statistics marketing list').innerHTML = s ? s : ui2.labels.noEntries;
			});
		}
	}
	static results(event, id) {
		event.stopPropagation();
		event.preventDefault();
		communication2.get('db/list?query=contact_listMarketing&search=' + encodeURIComponent('contactMarketing.clientMarketingId=' + id),
			function (r) {
				for (var i = 0; i < marketing.data.length; i++) {
					if (marketing.data[i].id == id) {
						var v = { ...marketing.data[i] };
						v.participants = r.length;
						v.answers = '';
						for (var i = 0; i < r.length; i++)
							r[i] = JSON.parse(r[i].storage);
						for (var i = 0; i < v.storage.questions.length; i++) {
							var choices = [], text = '';
							for (var i2 = 0; i2 < v.storage.questions[i].answers.length; i2++)
								choices.push(0);
							for (var i2 = 0; i2 < r.length; i2++) {
								if (r[i2]['q' + i]) {
									for (var i3 = 0; i3 < r[i2]['q' + i].choice.length; i3++)
										choices[r[i2]['q' + i].choice[i3]]++;
									if (r[i2]['q' + i].text)
										text += '<div>' + r[i2]['q' + i].text + '</div>';
								}
							}
							v.answers += '<question>' + v.storage.questions[i].question + '</question><answers>';
							for (var i2 = 0; i2 < v.storage.questions[i].answers.length; i2++)
								v.answers += '<answer><percentage>' + Math.round(choices[i2] / r.length * 100) + '</percentage>' + v.storage.questions[i].answers[i2].answer + '</answer>';
							v.answers += (text ? '<freetexttitle onclick="marketing.toggleFreetext(this)">Freitext</freetexttitle><freetext>' + text + '</freetext>' : '') + '</answers>';
						}
						ui.q('main.statistics popup panel').innerHTML = marketing.templateResults(v);
						ui.q('main.statistics popup').style.transform = 'scale(1)';
						break;
					}
				}
			});
	}
	static save() {
		communication2.save(marketing.html2json(), ui2.close);
	}
	static test() {
		var d = marketing.html2json();
		communication2.save(d,
			function () {
				d.storage = JSON.parse(d.storage);
				d.mode = 'test';
				marketing.data = d;
				marketing.open();
				window.close();
			});
	}
	static toggleAnswerType(e) {
		e.target.parentElement.classList = e.target.checked ? 'multiSelect' : '';
	}
	static toggleFreetext(e) {
		ui.toggleHeight(e.nextElementSibling);
	}
}