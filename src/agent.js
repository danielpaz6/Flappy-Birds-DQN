const tf = require("@tensorflow/tfjs");
import { getRandomInt, getRandomSubarray, sleep, gameSpeed } from "./index.js";
import { updateData } from "./graph.js";

export class Agent {
    constructor(env, model, episodes, gamma = 0.99, epsilon = 0.3,
        eps_decay = 0.9995, reply_size = 32, memory_maxlen = 10000, n_updates = 10) {
        this.env = env;
        this.model = model;
        this.episodes = episodes;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.eps_decay = eps_decay;
        this.reply_size = reply_size;
        this.memory_size = 0;
        this.memory_maxlen = memory_maxlen;
        this.memory = []
        this.n_updates = n_updates;
    }

    act(state) {
        if (Math.random() <= this.epsilon) {
            if (Math.random() <= 0.75)
                return 0
            else
                return getRandomInt(0, this.model.action_dim - 1);
        }
        
        var act_values = this.model.predict(state);
        var output = act_values.argMax(1);

        return output.dataSync()[0];
    }

    remember(state, action, reward, next_state, done) {
        this.memory[this.memory_size++ % this.memory_maxlen] = [state, action, reward, next_state, done];
    }

    async replay(size, isDDQL = false) {
        if (this.memory.length < size)
            return;

        var states = []
        var targets = []

        // Sample a batch of experiences from agent's memory
        var batch = getRandomSubarray(this.memory, size);

        // Extract information from the data
        // (state, action, reward, next_state, done)
        for (let i = 0; i < size; i++)
        {
            var currState = batch[i][0];
            var currAction = batch[i][1];
            var currReward = batch[i][2];
            var currNextState = batch[i][3];
            var currDone = batch[i][4];

            states.push(currState);

            // Predict Q values
            var q_values = this.model.predict([currState]).dataSync();
            
            if (currDone) {
                q_values[currAction] = currReward;
            }
            else {
                var q_values_next_max;

                if (isDDQL)
                    q_values_next_max = this.model.target_predict([currNextState]).max(1);
                else
                    q_values_next_max = this.model.predict([currNextState]).max(1);

                q_values[currAction] =
                    currReward + this.gamma * q_values_next_max.dataSync()[0];
            }

            targets.push(q_values);
        }

        await this.model.update(states, targets);
    }

    async learn(isDDQL = false) {
        for (let episode = 0; episode < this.episodes; episode++) {

            // update target network
            if (isDDQL) {
                if (episode % this.n_updates == 0)
                    this.model.target_update();
            }

            // Reset state
            var state = this.env.reset()[0];
            var done = false;
            var totalReward = 0;

            for (let time = 0; time < 30000; time++) {
                // Implement greedy search policy to explore the state space
                var action = this.act([state]);

                // Execute action a[t] in emulator and observe reward r[t] and state x[t+1]
                var data = this.env.step(action);
                var next_state = data[0];
                var reward = data[1];
                var done = data[2];

                // Update total and memory
                totalReward += reward;
                this.remember(state, action, reward, next_state, done);

                if (done) {
                    console.log("episode: " + episode + "/" + this.episodes +
                        ", score: " + time +
                        ", e: " + this.epsilon +
                        ", memory_size: " + this.memory_size +
                        ", total_reward: " + totalReward
					);
					
					const node = document.createElement("span");
					node.innerHTML = "episode: " + episode + "/" + this.episodes +
					", score: " + time +
					", e: " + (Math.round(this.epsilon * 100) / 100).toFixed(2) +
					", total_reward: " + (Math.round(totalReward * -100) / 100).toFixed(2) + "\n";

					document.getElementById("logs").appendChild(node);
					document.getElementById("el").scrollIntoView({behavior: "smooth"});
                    updateData(episode, time);
                    break;
                }


                state = next_state;

                // Slows the learning for debugging
                await sleep(gameSpeed);
            }

            // Updating
            await this.replay(this.reply_size, isDDQL);

            //if (episode == 2) {
            if ((episode + 1) % 3000 == 0) {
                //const saveResult = await agent.model.save('localstorage://my-model-' + e);
                await this.model.save('downloads://my-model-e' + (episode + 1));
            }

            // Update epsilon
            this.epsilon = Math.max(this.epsilon * this.eps_decay, 0.01)
        }
    }
}