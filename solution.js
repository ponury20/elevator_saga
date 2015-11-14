function {

	initApp : function(elevators, floors) {
		ELEVATORS = elevators;
		FLOORS = floors;
		FLOORS_QUEUE_UP = [];
		FLOORS_QUEUE_DOWN = [];

		UP = "up";
		DOWN = "down";
		
		setIndicators = function(elevator) {
			function indicators(goingUp, goingDown) {
				elevator.goingUpIndicator(goingUp);
				elevator.goingDownIndicator(goingDown);
			}
			
			var queue = elevator.destinationQueue;
			var currentFloor = elevator.currentFloor();
			var destFloor = queue.length > 0 ? queue[0] : currentFloor;
			if(currentFloor === destFloor && destFloor === 0)
				indicators(true, false);
			else if(currentFloor === destFloor && destFloor === (FLOORS.length-1))
				indicators(false, true);
			else if(currentFloor === destFloor && queue.length === 0){
				indicators(true, true);
			}
			else if(currentFloor < destFloor)
				indicators(true, false);
			else if(currentFloor > destFloor)
				indicators(false, true);
				
		};
		
		goToFloor = function(elevator, floorNum, immediate) {
			elevator.goToFloor(floorNum, immediate);
		};
		
		debug = function(message) {
			console.log(message);
		};
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
				goToFloor(elevator, floorNum, false);
		}

		function stopOnFloorFromQueue(floorNum, direction) {
			if (elevator.loadFactor() === 1)
				return;
			var idx = elevator.destinationQueue.indexOf(floorNum);
			if( idx >= 0) {
				elevator.destinationQueue.splice(idx, 1)
				debug('stopOnFloorFromQueue1 - removed from ELEVATOR QUEUE ' + floorNum + ' and should go there immediate');
				goToFloor(elevator, floorNum, true);
				return;
			}
			
			var queue = [];
			if (direction === UP || floorNum === (FLOORS.lenght - 1))
				queue = FLOORS_QUEUE_UP;
			else if (direction === DOWN || floorNum === 0)
				queue = FLOORS_QUEUE_DOWN;
			
			var idx = queue.indexOf(floorNum);
			if (idx >= 0) {
				debug('stopOnFloorFromQueue2 - removed from WAITING FLOOR QUEUE ' + floorNum + ' and should go there immediate');
				queue.splice(idx, 1);
				goToFloor(elevator, floorNum, true);	
			}
		}
		
		function notArrivedOnCallingFloor() {
			var currentFloor = FLOORS[elevator.currentFloor()];
			return currentFloor.buttonStates.up != "activated" 
				&& currentFloor.buttonStates.down != "activated";
		}

		function findAnyCallingFloor() {
			for (i=0; i<FLOORS_QUEUE_DOWN.length; i++) {
				var floorNum = FLOORS_QUEUE_DOWN[i];
				var alreadyPicked = false;
				for (i = 0; i < ELEVATORS.length; i++)
					if (ELEVATORS[i].destinationQueue.indexOf(floorNum) >= 0)
						alreadyPicked = true;
				if(!alreadyPicked) {
					goToFloor(elevator, floorNum, true);
					return;
				}
			}
			
			for (i=0; i<FLOORS_QUEUE_UP.length; i++) {
				var floorNum = FLOORS_QUEUE_UP[i];
				var alreadyPicked = false;
				for (i = 0; i < ELEVATORS.length; i++)
					if (ELEVATORS[i].destinationQueue.indexOf(floorNum) >= 0)
						alreadyPicked = true;
				if(!alreadyPicked) {
					goToFloor(elevator, floorNum, true);
					return;
				}
			}
			
			/*
			if (FLOORS_QUEUE_DOWN.length > 0) {
				var floorNum = FLOORS_QUEUE_DOWN[0];
				
				debug('findAnyCallingFloor1 - removed from WAITING FLOOR DOWN QUEUE ' + floorNum + ' and should go there immediate');
				goToFloor(elevator, floorNum, true);
			}
			else if (FLOORS_QUEUE_UP.length > 0) {
				var floorNum = FLOORS_QUEUE_UP.shift();
				debug('findAnyCallingFloor2 - removed from WAITING FLOOR UP QUEUE ' + floorNum + ' and should go there immediate');
				goToFloor(elevator, floorNum, true);
			}
			else
				goToFloor(elevator, elevator.currentFloor(), true);
			*/
		}

		function handleIdle() {
			if(notArrivedOnCallingFloor())
				findAnyCallingFloor();
			else
				goToFloor(elevator, elevator.currentFloor(), true);
		}

		function stoppedAtFloor(floorNum) {
			
			var idx = FLOORS_QUEUE_UP.indexOf(floorNum);
			if (idx >= 0 && (elevator.goingUpIndicator() || floorNum == FLOORS.length-1)) {
				debug('stoppedAtFloor1 - removed from WAITING FLOOR UP QUEUE ' + floorNum + ' and should go there immediate');
				FLOORS_QUEUE_UP.splice(idx, 1);
			}

			idx = FLOORS_QUEUE_DOWN.indexOf(floorNum);
			if (idx >= 0 && (elevator.goingDownIndicator() || floorNum == 0)) {
				debug('stoppedAtFloor2 - removed from WAITING FLOOR DOWN QUEUE ' + floorNum + ' and should go there immediate');
				FLOORS_QUEUE_DOWN.splice(idx, 1);
			}
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
		elevators.forEach(setIndicators);
	}
}