function SpinModel (name, spinProbFunction) {
	var i;
	
	this.name = name;
	this.fullName = name;
	this.spinProbFunction = spinProbFunction;
	this.states = [];
	this.maxStates = 12;
	
	//this.runModel.apply(this, []);
}

SpinModel.prototype.runModel = function (hitsPerSecond_, cooldown_, damage_) {
	var hitPeriod = 1, cooldown = 0.67, copy = {}, procChance = 0, time = 0, damage = 170;
	
	if (typeof hitsPerSecond_ !== 'undefined')
		hitPeriod = 1 / hitsPerSecond_;
	
	if (typeof cooldown_ !== 'undefined')
		cooldown = cooldown_;
	
	if (typeof damage_ !== 'undefined')
		damage = damage_;
	
	this.states = (function (spinProbFunction) {
		var tbl = [], i, state = 0, iterations = 100000, fires = 0, onCooldownFor = 0;
		
		for (i = 0; i < 12; i++) {
			tbl.push({prob:0, fire:0});
		}
		
		for (i = 0; i < iterations; i++) {
			tbl[state].prob += 1/iterations;
			onCooldownFor -= hitPeriod;
			time += hitPeriod;
			
			if (state == 11 || spinProbFunction(state + 1) > Math.random() && onCooldownFor <= 0) {
				tbl[state].fire += 1;
				state = 0;
				fires += 1;
				onCooldownFor = cooldown;
			} else {
				state += 1;
				onCooldownFor = onCooldownFor > 0 ? onCooldownFor : 0;
			}
		}
		
		procChance = /*damage * */fires / iterations;
		
		tbl.forEach(function (state, i) { tbl[i].fire /= fires; });
		
		return tbl;
	}(this.spinProbFunction));
	
	this.fullName = this.name + '[' + (1/hitPeriod) + ', ' + cooldown + ']';
	
	copy.fullName = this.fullName;
	copy.procChance = procChance;
	copy.states = this.states.map(function (state, i, arr) {
		return {
			fire: state.fire,
			cumul: i == 0 ? state.fire : arr.slice(0, i+1).reduce(function (sum, j) {
				return (typeof sum === "number" ? sum : sum.fire) + j.fire;
					
			}),
			prob: state.prob
		};
	});
	return copy;
}

SpinModel.prototype.toString = function () {
	return this.states.map(function (item) { return String(item.fire).substr(0, 6); }).toString();
}


var oldSpin, newSpin;
oldSpin = new SpinModel('O', function (nr) {
	if (nr == 12)
		return 1;
	return 0.17;
});

newSpin = new SpinModel('N', function newSpinProb (nr) {
	if (nr == 12)
		return 1;
	return 0.08 * (nr - 1);
});

document.write('<div id="plot" style="height:500px;width=800px;"></div><div id="plot2" style="height:500px;width=800px;"></div>');

var data = [
	oldSpin.runModel(0.5, 0.7),
	oldSpin.runModel(1.5, 0.7),
	oldSpin.runModel(2.9, 0.7),
	oldSpin.runModel(4.3, 0.7),

	oldSpin.runModel(0.5, 0.6),
	oldSpin.runModel(1.7, 0.6),
	oldSpin.runModel(3.4, 0.6),
	oldSpin.runModel(5.0, 0.6),


	newSpin.runModel(0.5, 0.7),
	newSpin.runModel(1.5, 0.7),
	newSpin.runModel(2.9, 0.7),
	newSpin.runModel(4.3, 0.7),

	newSpin.runModel(0.5, 0.6),
	newSpin.runModel(0.7, 0.6),
	newSpin.runModel(3.4, 0.6),
	newSpin.runModel(5.0, 0.6),
];

$.plot(
	$('#plot'), 
	data.map(function (item, i) {
		return {
			bars: {show: true},
			data: [[i, item.procChance]],
			color: (function (nr) {
				if (nr < 4) {
					return 'rgb(0, 0, ' + (80 + 50 * nr) + ')';				
				} else if (nr < 8) {
					return 'rgb(0, ' + (80 + (nr - 3) * 50) + ', 0)';
				} else if (nr < 12) {
					return 'rgb(' + (80 + (nr - 6) * 50) + ', 0, 0)';
				} else {
					return 'rgb(' + (80 + (nr - 9) * 50) + ', 0, ' + (80 + nr * 50) + ')';
				}
			}(i))
		};
	}),
	{xaxis: {
		ticks: data.map(function (item, i) {
			return [i + 0.5, item.fullName];
		})
	}}
);
$.plot($('#plot2'), data.map(function (spin, i) {
	return {
		label: spin.fullName,
		data: spin.states.map(function (state, index) { return [index, state.fire];}),
		color: (function (nr) {
			if (nr < 1) {
				return 'rgb(0, 0, ' + (120 + 40 * nr) + ')';				
			} else if (nr < 6) {
				return 'rgb(0, ' + (120 + (nr - 3) * 40) + ', 0)';
			} else if (nr < 9) {
				return 'rgb(' + (120 + (nr - 6) * 40) + ', 0, 0)';
			} else {
				return 'rgb(' + (120 + (nr - 9) * 40) + ', 0, ' + (120 + nr * 60) + ')';
			}
		}(i))
	};
}));