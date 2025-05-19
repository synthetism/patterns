/**
 * Interface for observer objects that want to be notified of changes
 * Powerful for implementing event-driven architectures
 * and decoupling components in your application.
 * @see /docs/observer.md
 */
export interface Observer<T> {
	update(data: T): void;
}

/**
 * Subject that maintains a list of observers and notifies them of changes
 */
export class Subject<T> {
	private observers: Observer<T>[] = [];

	/**
	 * Add an observer to be notified of changes
	 */
	subscribe(observer: Observer<T>): void {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer);
		}
	}

	/**
	 * Remove an observer from the notification list
	 */
	unsubscribe(observer: Observer<T>): void {
		const index = this.observers.indexOf(observer);
		if (index !== -1) {
			this.observers.splice(index, 1);
		}
	}

	/**
	 * Notify all observers of a change
	 */
	notify(data: T): void {
		for (const observer of this.observers) {
			observer.update(data);
		}
	}
}
