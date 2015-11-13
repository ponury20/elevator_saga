# elevator_saga
*Simple javascript solutions to the elevator saga (http://play.elevatorsaga.com/)*

* When somebody press a button on the elevator - go to that floor (if not already in elevator queue). 
* When passing a floor - check if floor is on queue with the same direction as the elevator. 
* When elevator is idle - find any calling floor (start from calling to go down). 
* When elevator stopped at floor - clear (if needed) queues of calling floors.
* When somebody calls elevator on the floor - put floor to proper queue and call an idle elevator 
(if no elevator is currently going to that floor)

## challenge #1

**Efficiency = 100% (100/100)**

## challenge #2

**Efficiency = 86% (86/100) (fail)**