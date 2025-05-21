import { describe, it, expect, vi } from "vitest";
import {
	TemperatureSensor,
	TemperatureDisplay,
	TemperatureAlert,
} from "./temperature-monitor";

describe("Temperature Monitor Example", () => {
	it("should update displays when temperature changes", () => {
		// Create the sensor
		const sensor = new TemperatureSensor("celsius");

		// Create displays
		const display1 = new TemperatureDisplay("Living Room");
		const display2 = new TemperatureDisplay("Bedroom");

		// Subscribe displays
		sensor.subscribe(display1);
		sensor.subscribe(display2);

		// Set temperature
		sensor.setTemperature(25);

		// Verify displays were updated
		expect(display1.getLastTemperature()?.value).toBe(25);
		expect(display2.getLastTemperature()?.value).toBe(25);
	});

	it("should trigger alerts when temperature exceeds threshold", () => {
		// Create the sensor
		const sensor = new TemperatureSensor("celsius");

		// Create alert
		const alert = new TemperatureAlert(30, "celsius");

		// Subscribe alert
		sensor.subscribe(alert);

		// Set temperatures
		sensor.setTemperature(25); // Below threshold
		sensor.setTemperature(32); // Above threshold

		// Verify alert was triggered
		expect(alert.getAlerts().length).toBe(1);
		expect(alert.getAlerts()[0]).toContain("ALERT");
		expect(alert.getAlerts()[0]).toContain("32");
	});

	it("should convert temperature units properly", () => {
		// Create the sensor with Celsius
		const sensor = new TemperatureSensor("celsius");

		// Create alert with Fahrenheit
		const alert = new TemperatureAlert(86, "fahrenheit"); // 30°C = 86°F

		// Subscribe alert
		sensor.subscribe(alert);

		// Set temperatures
		sensor.setTemperature(25); // Below threshold (77°F)
		sensor.setTemperature(32); // Above threshold (89.6°F)

		// Verify alert was triggered
		expect(alert.getAlerts().length).toBe(1);
	});

	it("should not notify unsubscribed observers", () => {
		// Create the sensor
		const sensor = new TemperatureSensor("celsius");

		// Create displays
		const display = new TemperatureDisplay("Living Room");

		// Subscribe display
		sensor.subscribe(display);

		// Set initial temperature
		sensor.setTemperature(25);
		expect(display.getLastTemperature()?.value).toBe(25);

		// Unsubscribe display
		sensor.unsubscribe(display);

		// Set new temperature
		sensor.setTemperature(30);

		// Verify display still shows old temperature
		expect(display.getLastTemperature()?.value).toBe(25);
	});
});
