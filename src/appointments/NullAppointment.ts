import {Appointment} from "./Appointment";
import {Day} from "./Day";
import {Time} from "./Time";

export default class NullAppointment extends Appointment {
    constructor() {
        super("", new Day(1,1,1), new Time(0,0));
    }
}