import { communication } from "./communication";
import { ui } from "./ui";

export { marketing }

class marketing {
	static data;
	static templateEdit = v =>
		window.opener.global.template`<fieldset${v.disabled}>
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
		<input type="checkbox" name="gender" value="2" label="${window.opener.ui.l('female')}" ${v.gender && v.gender.indexOf(2) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="1" label="${window.opener.ui.l('male')}" ${v.gender && v.gender.indexOf(1) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="3" label="${window.opener.ui.l('divers')}" ${v.gender && v.gender.indexOf(3) > -1 ? ' checked' : ''} />
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
	<label>Einleitung</label>
	<value><textarea name="prolog">${v.storage.prolog}</textarea></value>
</field>
<questions>${marketing.templateQuestion(v.storage.questions ? v.storage.questions[0] : {})}</questions>
<field>
	<label>Schlusswort</label>
	<value><textarea name="epilog">${v.storage.epilog}</textarea></value>
</field>
<br />
<buttontext class="bgColor${v.hideSave}" onclick="marketing.save()">${window.opener.ui.l('save')}</buttontext>
</fieldset>`;
	static templateQuestion = v =>
		window.opener.global.template`<field>
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
		window.opener.global.template`<answer>
<input name="answer" onblur="marketing.addAnswer(this)" value="${v.answer}"></input>
<select name="next">${v.nextOptions}</select>
</answer>`;
	static templateList = v =>
		window.opener.global.template`<row onclick="marketing.edit(${v.id})"><div>${v.storage.prolog}<br />${v.storage.questions[0].question}<br />${v.storage.epilog}</div></row>`;
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
			e2.innerHTML = marketing.templateQuestion({});
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static edit(id) {
		var e = ui.q('popup').style;
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
			v = { id: max + 1 };
		}
		if (v.startDate && window.opener.global.date.server2local(v.startDate) < new Date()) {
			v.disabled = ' disabled';
			v.hideSave = ' hidden';
		}
		ui.q('popup panel').innerHTML = marketing.templateEdit(v);
		e.transform = 'scale(1)';
		if (v.storage.questions) {
			for (var i = 0; i < v.storage.questions.length; i++) {
				if (i > 0) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateQuestion({ index: i + 1, ...v.storage.questions[i] });
					ui.q('popup questions').appendChild(e2.children[0]);
				}
				for (var i2 = 1; i2 < v.storage.questions[i].answers.length; i2++) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateAnswer(v.storage.questions[i].answers[i2]);
					var e3 = ui.qa('popup questions>field:nth-child(' + (i + 1) + ')>value')[1];
					e3.insertBefore(e2.children[0], e3.querySelector('input[type="checkbox"]'));
				}
			}
		}
		window.opener.formFunc.initFields(ui.q('popup panel'));
	}
	static html2json() {
		var e = ui.qa('questions field'), o = {};
		var read = function (label, o) {
			var e2 = ui.q('popup [name="' + label + '"]');
			if (e2.type == 'checkbox' || e2.type == 'radio') {
				e2 = ui.qa('popup [name="' + label + '"]:checked');
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
		if (!ui.q('marketing list').innerHTML) {
			communication.get('statistics/marketing', function (r) {
				marketing.data = r;
				var s = '';
				for (var i = 0; i < r.length; i++) {
					r[i].storage = JSON.parse(r[i].storage);
					s += marketing.templateList(r[i]);
				}
				ui.q('marketing list').innerHTML = s ? s : ui.labels.noEntries;
			});
		}
	}
	static save() {
		communication.save(marketing.html2json(), ui.close);
	}
	static toggleAnswerType(e) {
		e.target.parentElement.classList = e.target.checked ? 'multiSelect' : '';
	}
}