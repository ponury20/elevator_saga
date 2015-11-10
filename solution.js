var foo = 
{		
    init: function(elevators, floors) {
    	
    	var UP = "up";
		var DOWN = "down";
		var STOPPED = "stopped";
		
		var floorsCalling = [];
		
		function addFloorToQueue(floorNum) {
			if(floorsCalling.indexOf(floorNum) < 0) {
				floorsCalling[floorsCalling.length] = floorNum;
			}
		}
		
    	function setElevatorDirection(elevator, goingUp, goingDown) {
			elevator.goingUpIndicator(goingUp);
			elevator.goingDownIndicator(goingDown);
		};
    	
    	function sendElevatorToFloor(elevator, floorNum){
    		
    		function sortFromDirection() {
    			return function(a, b) {
    				if(elevator.destinationDirection() === DOWN)
    					return b-a;
    				else 
    					return a-b;
    			};
    		};
    		
    		function setElevatorIndicators() {
    			var currentFloor = elevator.currentFloor();
    			var destination = elevator.destinationDirection();
    			if((destination === UP || destination === STOPPED) && currentFloor<=floorNum)
    				setElevatorDirection(elevator, true, false);
    			if((destination === DOWN || destination === STOPPED) && currentFloor>=floorNum)
    				setElevatorDirection(elevator, false, true);
    		};
    		
    		function sortElevatorFloorsQueue() {
    			var queue = elevator.destinationQueue;
    			if(queue.length > 1)
    				queue.sort(sortFromDirection());
    			elevator.destinationQueue = queue;
    			elevator.checkDestinationQueue();
    		};
    		
    		
			elevator.goToFloor(floorNum);
    		
    		sortElevatorFloorsQueue();
    		setElevatorIndicators();
    			
    	};
    	
    	function initElevator(elevator) {
    		
    		function sortFromFloor() {
    			return function(a, b) {
    				var currentFloor = elevator.currentFloor();
    				var aLength = Math.abs(a-currentFloor);
    				var bLength = Math.abs(b-currentFloor);
    				return aLength - bLength;
    			};
    		};
    		
    		function goToNearFloorCalling() {
    			if(floorsCalling.length > 0) {
    				if(floorsCalling.length > 1) 
    					floorsCalling.sort(sortFromFloor());
    				elevator.goToFloor(floorsCalling.shift());
    			} else {
    				elevator.goToFloor(elevator.currentFloor());
    			}
    		};
    		
    		function resetElevator(){
    			//if(floorsCalling.length === 0)
    				setElevatorDirection(elevator, true, true);
    			goToNearFloorCalling();
    		};
    		
    		function floorBtnPressed(floorNum) {
    			sendElevatorToFloor(elevator, floorNum);
    		};
    		
    		function passingFloor(floorNum, direction) {
    			if(floorsCalling.indexOf(floorNum) < 0)
    				return;
    			
    			var currentFloor = elevator.currentFloor();
    			if((direction === UP && floorNum>=currentFloor) || (direction === DOWN && floorNum<=currentFloor)) {
    				if(floorsCalling.length > 1) 
    					floorsCalling.sort(sortFromFloor());
    				elevator.goToFloor(floorsCalling.shift(), true);
    			}
    				//sendElevatorToFloor(elevator, floorNum);
    				
    		};
    		
    		function stoppedAtFloor(floorNum) {
    			if(floorNum === 0)
    				setElevatorDirection(elevator, true, false);
    			if(floorNum === floors.lenght-1)
    				setElevatorDirection(elevator, false, true);
    		};
    		
    		elevator.on("idle", resetElevator);
    		elevator.on("floor_button_pressed", floorBtnPressed)
    		elevator.on("passing_floor", passingFloor);
    		//elevator.on("stopped_at_floor", stoppedAtFloor);
    	};
    	
    	function initFloor(floor) {
    		function isIdle(elevator) {
    			return elevator.goingUpIndicator() && elevator.goingDownIndicator();	
    		};
    		
    		function callIdleElevator() {
    			var idle = elevators.filter(isIdle);
    			if(idle.length > 0)
    				sendElevatorToFloor(idle[0], floor.floorNum());
    			else
    				addFloorToQueue(floor.floorNum());
    			
    		};
    		
    		floor.on("up_button_pressed", callIdleElevator);
    		floor.on("down_button_pressed", callIdleElevator);
    	};
    	
    	elevators.forEach(initElevator);
        floors.forEach(initFloor);
    },
    
    
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}