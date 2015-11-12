var foo = 
{
	GROUND_FLOOR: 0,
	
	initApp: function(elevators, floors) {
		GROUND_FLOOR = floors[0].floorNum();
	},
	
	/**
	 * Initialize elevator -- add event listeners
	 * - when somebody enters the elevator, go to floor requested
	 * - when elevator is idle, go to the ground floor
	 * @param elevator
	 */		
	initElevator: function(elevator) {
		
		function floorBtnPressed(floorNum) {
			this.goToFloor(floorNum);
		};
		
		function handleIdle() {
			this.goToFloor(GROUND_FLOOR);
		};
		
		elevator.on("floor_button_pressed", floorBtnPressed);
		elevator.on("idle", handleIdle);
	},
		
    init: function(elevators, floors) {
       this.initApp(elevators, floors);
       elevators.forEach(this.initElevator);
    },
    
    
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}