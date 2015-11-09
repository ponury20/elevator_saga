var foo = 
{
	
	initElevator: function(elevator) {
		function floorBtnPressed(floorNum) {
			this.goToFloor(floorNum);
		};
		
		elevator.on("floor_button_pressed", floorBtnPressed);
	},
	
	
		
    init: function(elevators, floors) {
       elevators.forEach(this.initElevator);
    },
    
    
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}