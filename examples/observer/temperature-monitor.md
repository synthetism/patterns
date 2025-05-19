# Temperature Monitor

Example that demonstrates the Observer pattern in action

```typescript
import { Subject, Observer } from '../../src/patterns/observer';

/**
 * Temperature data structure
 */
interface TemperatureData {
  value: number;
  unit: 'celsius' | 'fahrenheit';
  timestamp: Date;
}

/**
 * Temperature sensor that reports temperature changes
 */
export class TemperatureSensor extends Subject<TemperatureData> {
  private currentTemperature: number = 0;
  
  constructor(private unit: 'celsius' | 'fahrenheit' = 'celsius') {
    super();
  }
  
  /**
   * Set the current temperature and notify all observers
   */
  setTemperature(value: number): void {
    this.currentTemperature = value;
    
    this.notify({
      value,
      unit: this.unit,
      timestamp: new Date()
    });
  }
  
  /**
   * Get the current temperature
   */
  getTemperature(): number {
    return this.currentTemperature;
  }
}

/**
 * Display that shows the current temperature
 */
export class TemperatureDisplay implements Observer<TemperatureData> {
  private lastTemperature: TemperatureData | null = null;
  
  constructor(private name: string) {}
  
  update(data: TemperatureData): void {
    this.lastTemperature = data;
    this.display();
  }
  
  private display(): void {
    if (!this.lastTemperature) return;
    
    console.log(
      `[${this.name}] Temperature: ${this.lastTemperature.value}°${this.lastTemperature.unit.charAt(0).toUpperCase()} at ${this.lastTemperature.timestamp.toLocaleTimeString()}`
    );
  }
  
  getLastTemperature(): TemperatureData | null {
    return this.lastTemperature;
  }
}

/**
 * Temperature alert that triggers when temperature exceeds threshold
 */
export class TemperatureAlert implements Observer<TemperatureData> {
  private alerts: string[] = [];
  
  constructor(private threshold: number, private unit: 'celsius' | 'fahrenheit') {}
  
  update(data: TemperatureData): void {
    // Convert temperature if units don't match
    let temperature = data.value;
    if (data.unit !== this.unit) {
      temperature = this.convertTemperature(temperature, data.unit, this.unit);
    }
    
    if (temperature > this.threshold) {
      const alert = `ALERT: Temperature (${temperature}°${this.unit.charAt(0).toUpperCase()}) exceeded threshold of ${this.threshold}°${this.unit.charAt(0).toUpperCase()} at ${data.timestamp.toLocaleTimeString()}`;
      this.alerts.push(alert);
      console.log(alert);
    }
  }
  
  private convertTemperature(
    value: number, 
    fromUnit: 'celsius' | 'fahrenheit', 
    toUnit: 'celsius' | 'fahrenheit'
  ): number {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (value * 9/5) + 32;
    } else {
      return (value - 32) * 5/9;
    }
  }
  
  getAlerts(): string[] {
    return [...this.alerts];
  }
}

/**
 * Example usage function
 */
export function temperatureMonitorDemo(): void {
  // Create the sensor (subject)
  const sensor = new TemperatureSensor('celsius');
  
  // Create observers
  const display1 = new TemperatureDisplay('Living Room');
  const display2 = new TemperatureDisplay('Bedroom');
  const alert = new TemperatureAlert(30, 'celsius');
  
  // Subscribe observers
  sensor.subscribe(display1);
  sensor.subscribe(display2);
  sensor.subscribe(alert);
  
  // Simulate temperature changes
  sensor.setTemperature(25);
  sensor.setTemperature(28);
  sensor.setTemperature(32); // This should trigger the alert
  sensor.setTemperature(29);
  
  // Unsubscribe one display
  sensor.unsubscribe(display2);
  
  // Should only notify display1 and alert
  sensor.setTemperature(33);
}
```

