import { communication } from "./communication";
import { ui } from "./ui";

export { marketing }

class marketing {
	static data;
	static templateEdit = v =>
		window.opener.global.template`<div>
<field>
	<label>Zeitraum</label>
	<value class="marketingPeriod">
		<input name="from" placeholder="TT.MM.JJJJ" type="date"></input>
		<input name="to" placeholder="TT.MM.JJJJ" type="date"></input>
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		<input type="checkbox" name="gender" value="2" label="${window.opener.ui.l('female')}" ${v.gender2} />
		<input type="checkbox" name="gender" value="1" label="${window.opener.ui.l('male')}" ${v.gender1} />
		<input type="checkbox" name="gender" value="3" label="${window.opener.ui.l('divers')}" ${v.gender3} />
	</value>
</field>
<field>
	<label>Alter</label>
	<value>
		<input type="text" slider="range" min="18" max="99" name="age" />
	</value>
</value>
</field>
<field>
	<label>Region</label>
	<value>
		<input name="region" />
		<explain>2 stelliges Länderkürzel und/oder PLZen und/oder Städte, z.B.<br />CH DE-8 Nürnberg Hamburg</explain>
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value><textarea name="prolog"></textarea></value>
</field>
<questions>${marketing.templateQuestion(v)}</questions>
<field>
	<label>Schlusswort</label>
	<value><textarea name="epilog"></textarea></value>
</field>
<br />
<buttontext class="bgColor" onclick="marketing.save()">${window.opener.ui.l('save')}</buttontext>
</div>`;
	static templateQuestion = v =>
		window.opener.global.template`<field class="question${v.question}">
	<label>Frage ${v.question}</label>
	<value><input name="question" onblur="marketing.addQuestion(this)"></input></value>
	<label>Antworten</label>
	<value>
		<input type="checkbox" name="answer_type" value="1"></input>
		<label onclick="marketing.toggleAnswerType(event)">Mehrfachauswahl</label>
		${marketing.templateAnswer(v)}
	</value>
</field>`;
	static templateAnswer = v =>
		window.opener.global.template`<answer>
<input name="answer" onblur="marketing.addAnswer(this)"></input>
<nextQuestion><span>nächste Frage</span><select name="next">${v.nextOptions}</select></nextQuestion>
</answer>`;
	static templateList = v =>
		window.opener.global.template`<row onclick="marketing.edit(${v.index})"><div>${v.prolog}<br />${v.questions[0].question}<br />${v.epilog}</div></row>`;
	static addAnswer(e) {
		if (e.value && e.parentElement.parentElement.lastElementChild == e.parentElement) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateAnswer({});
			e.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static addQuestion(e) {
		if (e.value && e.parentElement.parentElement.parentElement.lastElementChild == e.parentElement.parentElement) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateQuestion({});
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static edit(i) {
		var e = ui.q('popup').style;
		if (e.transform && e.transform.indexOf('1') > 0) {
			e.transform = 'scale(0)';
			return;
		}
		ui.q('popup panel').innerHTML = marketing.templateEdit(i >= 0 ? marketing.data.marketing[i] : {});
		window.opener.formFunc.initFields('popup panel');
		e.transform = 'scale(1)';
	}
	static html2json() {
		var e = ui.qa('questions field'), o = { questions: [] };
		var read = function (label, o) {
			if (ui.q('popup [name="' + label + '"]').value)
				o[label] = ui.q('popup [name="' + label + '"]').value;
		}
		read('prolog', o);
		read('from', o);
		read('to', o);
		read('gender', o);
		read('age', o);
		read('region', o);
		read('epilog', o);
		for (var i = 0; i < e.length; i++) {
			if (e[i].querySelector('input[name="question"]').value) {
				var q = {
					question: e[i].querySelector('input[name="question"]').value,
					answerType: e[i].querySelector('input[type="checkbox"]').checked,
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
				o.questions.push(q);
			}
		}
		return o;
	}
	static init() {
		if (!ui.q('marketing list').innerHTML) {
			communication.get('statistics/marketing', function (r) {
				marketing.data = r;
				var s = '';
				if (r.marketing) {
					for (var i = 0; i < r.marketing.length; i++)
						s += marketing.templateList({ index: i, ...r.marketing[i] });
				}
				ui.q('marketing list').innerHTML = s ? s : ui.labels.noEntries;
			});
		}
	}
	static save() {
		marketing.data.marketing = [marketing.html2json()];
		communication.save(marketing.data, ui.close);
	}
	static toggleAnswerType(e) {
		window.opener.formFunc.toggleCheckbox(e);
		e.target.parentElement.classList = e.target.previousElementSibling.checked ? 'multiSelect' : '';
	}
}