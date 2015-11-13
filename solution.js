function {

	initApp : function(elevators, floors) {
		GROUND_FLOOR = 0;
		HIGH_FLOOR = floors.lenght - 1;
		ELEVATORS = elevators;
		FLOORS = floors;
		FLOORS_QUEUE_UP = [];
		FLOORS_QUEUE_DOWN = [];

		UP = "up";
		DOWN = "down";
	},

	/**
	 * When somebody press a button on the elevator - go to that floor. When
	 * passing a floor - check if floor is on queue with the same direction as
	 * the elevator. When elevator is idle - find any calling floor (start from
	 * calling to go down). When elevator stopped at floor - clear if needed
	 * queues of calling floors.
	 * 
	 * @param elevator
	 */
	initElevator : function(elevator) {

		function floorBtnPressed(floorNum) {
			if (elevator.destinationQueue.indexOf(floorNum) < 0)
				elevator.goToFloor(floorNum);
		}

		function stopOnFloorFromQueue(floorNum, direction) {
			if (elevator.loadFactor() === 1)
				return;
			var queue = [];
			if (direction === UP || floorNum === HIGH_FLOOR) {
				queue = FLOORS_QUEUE_UP;
			} else if (direction === DOWN || floorNum === GROUND_FLOOR) {
				queue = FLOORS_QUEUE_DOWN;
			}
			var idx = queue.indexOf(floorNum);
			if (idx >= 0) {
				queue.splice(idx, 1);
				elevator.goToFloor(floorNum, true);
			}
		}

		function findAnyCallingFloor() {
			if (FLOORS_QUEUE_DOWN.length > 0)
				elevator.goToFloor(FLOORS_QUEUE_DOWN.shift(), true);
			else if (FLOORS_QUEUE_UP.length > 0)
				elevator.goToFloor(FLOORS_QUEUE_UP.shift(), true);
		}

		function handleIdle() {
			findAnyCallingFloor();
		}

		function stoppedAtFloor(floorNum) {
			var idx = FLOORS_QUEUE_UP.indexOf(floorNum);
			if (idx >= 0)
				FLOORS_QUEUE_UP.splice(idx, 1);

			idx = FLOORS_QUEUE_DOWN.indexOf(floorNum);
			if (idx >= 0)
				FLOORS_QUEUE_DOWN.splice(idx, 1);
		}

		elevator.on("floor_button_pressed", floorBtnPressed);
		elevator.on("passing_floor", stopOnFloorFromQueue);
		elevator.on("idle", handleIdle);
		elevator.on("stopped_at_floor", stoppedAtFloor);
	},

	/**
	 * Initialize floor -- add event listeners - when somebody calls elevator
	 * put floor to proper queue and call an idle elevator if no elevator is
	 * currently going to that floor
	 * 
	 * @param floor
	 */
	initFloor : function(floor) {

		function callElevator() {
			for (i = 0; i < ELEVATORS.length; i++)
				if (ELEVATORS[i].destinationQueue.indexOf(floor.floorNum) >= 0)
					return;

			for (i = 0; i < ELEVATORS.length; i++)
				if (ELEVATORS[i].destinationQueue.length === 0) {
					ELEVATORS[i].trigger("idle");
					return;
				}

			// ELEVATORS[0].trigger("idle");

		}

		function queueUp(floor) {
			if (FLOORS_QUEUE_UP.indexOf(floor.floorNum()) < 0) {
				FLOORS_QUEUE_UP.push(floor.floorNum());
				callElevator();
			}

		}

		function queueDown(floor) {
			if (FLOORS_QUEUE_DOWN.indexOf(floor.floorNum()) < 0) {
				FLOORS_QUEUE_DOWN.push(floor.floorNum());
				callElevator();
			}

		}

		floor.on("up_button_pressed", queueUp);
		floor.on("down_button_pressed", queueDown);
	},

	init : function(elevators, floors) {
		this.initApp(elevators, floors);
		elevators.forEach(this.initElevator);
		floors.forEach(this.initFloor);
	},

	update : function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}