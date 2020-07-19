const tf = require("@tensorflow/tfjs");
import * as game from './game.js';
import { DDQL } from './ddql.js';
import { Agent } from './agent.js';
import { Environment } from './environment.js';

export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomSubarray(arr, size) {
	var shuffled = arr.slice(0),
		i = arr.length,
		min = i - size,
		temp,
		index;
	while (i-- > min) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(min);
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//env = new Environment();

var readyStateCheck = setInterval(async function () {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheck);
		game.initGame();
		await startTraining();
		//setTimeout(startTraining, 2000);
	}
}, 10);

export let gameSpeed = 50;

export async function startTraining() {
	var env = new Environment();

	var m1 = await tf.loadLayersModel("https://raw.githubusercontent.com/danielpaz6/flappy-birds-dqn/master/my-model-e3.json");
	var m2 = await tf.loadLayersModel("https://raw.githubusercontent.com/danielpaz6/flappy-birds-dqn/master/my-model-e3.json");

	m1.compile({
		loss: "meanSquaredError",
		optimizer: "adam",
	});

	m2.compile({
		loss: "meanSquaredError",
		optimizer: "adam",
	});

	var ddql = new DDQL(m1, m2, 4, 2);
	//var dql = new DQL(4, 2);
	var agent = new Agent(env, ddql, 50000);

	console.log("Start learning!");
	agent.learn(true);
}

document.getElementById("speedUp").addEventListener("click", function(){
	gameSpeed = gameSpeed <= 10 ? 10 : gameSpeed - 10;
});

document.getElementById("speedDown").addEventListener("click", function(){
	gameSpeed = gameSpeed >= 100 ? 100 : gameSpeed + 10;
});
