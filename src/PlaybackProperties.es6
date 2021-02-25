class PlaybackPropertiesSingleton {

	constructor() {

		//console.log("Created instance");

		this.advolCallbacks = [];

		this.advol = document.querySelector("#advol");

		this.advol.onchange = () => {
			this.advolCallbacks.forEach(callback => {
				callback(this.getCurrentGain());
			});
		};
	}

	//Fetch UI gain value
	getCurrentGain() {
		//console.info("Call to get current gain");
		return parseFloat(this.advol.value);
	}

	//Register function and return its index
	registerCallback(fn) {
		return this.advolCallbacks.push(fn) - 1;
	}

	//Deregister callback by index
	deregisterCallback(index) {
		delete this.advolCallbacks[index];
	}
}

const PlaybackProperties = new PlaybackPropertiesSingleton();
export default PlaybackProperties;
