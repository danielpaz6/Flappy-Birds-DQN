const tf = require("@tensorflow/tfjs");

export class DQL {
    constructor(model, state_dim, action_dim, hidden_dim = 64) {
        this.state_dim = state_dim;
        this.action_dim = action_dim;

        this.model = model;
        /*this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: hidden_dim, inputShape: [state_dim], activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: hidden_dim*2, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: action_dim }));

        this.model.compile({
            loss: 'meanSquaredError',
            optimizer: 'adam'
        });*/
    }

    async update(state, y) {
        await this.model.fit(
            tf.tensor2d(state, [state.length, this.state_dim]),
            tf.tensor2d(y, [y.length, this.action_dim]),
            { epochs: 1, verbose: 0 }
        );
    }

    predict(state) {
        return this.model.predict(tf.tensor2d(state, [state.length, this.state_dim]));
    }

    async save(str) {
        return await this.model.save(str);
    }
}