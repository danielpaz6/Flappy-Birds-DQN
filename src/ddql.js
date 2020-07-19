import { DQL } from "./dql.js";
const tf = require("@tensorflow/tfjs");

export class DDQL extends DQL {
	constructor(model, copy_model, state_dim, action_dim, hidden_dim = 64) {
		super(model, state_dim, action_dim, hidden_dim);

		this.target = copy_model; // should be deep copy of DQL's model.
	}

	target_predict(state) {
		return this.target.predict(
			tf.tensor2d(state, [state.length, this.state_dim])
		);
	}

	/*async*/ target_update() {
		/*await this.model.save('localstorage://my-model-target');
        this.copy_model = await tf.loadLayersModel('localstorage://my-model-target');

        this.copy_model.compile({
            loss: 'meanSquaredError',
            optimizer: 'adam'
        });*/

		//this.copy_model.setWeights(this.model.getWeights());
		this.target.setWeights(this.model.getWeights());
	}
}
