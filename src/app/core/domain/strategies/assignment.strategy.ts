import { Observable } from 'rxjs';
import { Viaje } from '../../models/viaje.model';
import { Conductor } from '../models/conductor.model';

export abstract class DriverAssignmentStrategy {
	abstract findDriver(trip: Viaje): Observable<Conductor>;
}
