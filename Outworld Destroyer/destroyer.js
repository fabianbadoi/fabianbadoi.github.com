var tries = 100000,
	maxHits = [40],
	procChance = 0.4,
	manaRestored = 0.25,
	manaCost = 100,
	manaPoolSets = [
		{
			maxHits: 200,
			pools: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000]
		}
// 		{
// 			maxHits: 25,
// 			pools: [500, 600, 700]
// 		}, 
// 		{
// 			maxHits: 50,
// 			pools: [800, 900, 1000]
// 		}, 
// 		{
// 			maxHits: 200,
// 			pools: [1100, 1200, 1300]
// 		}, 
// 		{
// 			maxHits: 200,
// 			pools: [1400, 1500, 1600]
// 		}, 
// 		{
// 			maxHits: 200,
// 			pools: [1400, 1600, 1800]
// 		}, 
// 		{
// 			maxHits: 200,
// 			pools: [2000, 2400, 2800]
// 		}
	];

manaPoolSets.forEach(function (manaPools, manaPoolsIndex) {
	var simulations = [];
	
	manaPools.pools.forEach(function (manaPool) {
		var i,
			j,
			hits = manaPools.maxHits,
			mana,
			outcomes = {
				maxHits: hits,
				manaPool: manaPool,
				data: (function (){
					var arr = Array(hits),
					i;
					
					for (i = 0; i < hits; i++) {
						arr[i] = 0;
					}
					
					return arr;
				}())
			},
			currentHits;
		
		for (i = 0; i < tries; i++) {
			currentHits = 0;
			mana = manaPool;
			
			for (j = 0; j < hits; j++) {
				outcomes.data[currentHits] += 1 / tries;
				
				mana -= manaCost;
				currentHits++;
				
				if (Math.random() < procChance) {
					mana += manaPool * manaRestored;
					mana = mana > manaPool ? manaPool : mana;
				}
				
				if (mana < manaCost)
					break;
			}
		}
		
		simulations.push(outcomes);
	});


	document.write('<div id="plot-' + manaPoolsIndex + '" style="width:90%;height:500px;"></div><p>x axis - number of hits<br />y axis - chance of getting x hits with that manapool</p>');

	$.plot(
		$('#plot-' + manaPoolsIndex),
		simulations.map(function (sim) {
			return {
				label: 'Mana: ' + sim.manaPool,
				data: sim.data.map(function (val, index) { return [index + 1, val]; })
			};
		}),
		{
			xaxis: {ticks: 20, name: 'Number of hits'},
			yaxis: {ticks: 10, name: 'Chance of success'}
		}
	);
});
// $.plot($('#plot2'), data.map(function (spin, i) {
// 	return {
// 		label: spin.fullName,
// 		data: spin.states.map(function (state, index) { return [index, state.fire];}),
// 		color: (function (nr) {
// 			if (nr < 1) {
// 				return 'rgb(0, 0, ' + (120 + 40 * nr) + ')';				
// 			} else if (nr < 6) {
// 				return 'rgb(0, ' + (120 + (nr - 3) * 40) + ', 0)';
// 			} else if (nr < 9) {
// 				return 'rgb(' + (120 + (nr - 6) * 40) + ', 0, 0)';
// 			} else {
// 				return 'rgb(' + (120 + (nr - 9) * 40) + ', 0, ' + (120 + nr * 60) + ')';
// 			}
// 		}(i))
// 	};
// }));