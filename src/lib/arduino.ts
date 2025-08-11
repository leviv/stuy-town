// TypeScript declarations for WebSerial API
declare global {
	interface Navigator {
		serial: Serial;
	}
	interface Serial {
		requestPort(): Promise<SerialPort>;
	}
	interface SerialPort {
		open(options: { baudRate: number }): Promise<void>;
		close(): Promise<void>;
		readable: ReadableStream;
		writable: WritableStream;
	}
}

export interface ArduinoData {
	heading: number;
	pitch: number;
	roll: number;
}

export interface ArduinoStatus {
	enabled: boolean;
	status: string;
	isConnected: boolean;
}

export class ArduinoController {
	private port: SerialPort | null = null;
	private reader: ReadableStreamDefaultReader | null = null;
	private isConnected = false;
	private onDataCallback: ((data: ArduinoData) => void) | null = null;
	private onStatusCallback: ((status: ArduinoStatus) => void) | null = null;

	constructor(
		onDataUpdate?: (data: ArduinoData) => void,
		onStatusUpdate?: (status: ArduinoStatus) => void
	) {
		this.onDataCallback = onDataUpdate || null;
		this.onStatusCallback = onStatusUpdate || null;
	}

	private updateStatus(enabled: boolean, status: string) {
		if (this.onStatusCallback) {
			this.onStatusCallback({
				enabled,
				status,
				isConnected: this.isConnected
			});
		}
	}

	async connect(): Promise<void> {
		try {
			if (!(navigator as any).serial) {
				alert('WebSerial is not supported in this browser. Try Chrome or MS Edge.');
				return;
			}

			// Check if already connected
			if (this.isConnected && this.port) {
				console.log('Arduino already connected');
				return;
			}

			// Disconnect any existing connection first
			await this.disconnect();

			this.updateStatus(false, 'Connecting...');
			console.log('Requesting serial port...');
			this.port = await (navigator as any).serial.requestPort();

			console.log('Opening serial port...');
			await this.port.open({
				baudRate: 9600,
				dataBits: 8,
				stopBits: 1,
				parity: 'none',
				flowControl: 'none'
			});

			const textDecoder = new TextDecoderStream();
			const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
			this.reader = textDecoder.readable.getReader();

			this.isConnected = true;
			this.updateStatus(true, 'Connected');
			console.log('Arduino connected successfully');

			// Wait a moment for Arduino to initialize
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Send initial request for data
			try {
				const writer = this.port.writable.getWriter();
				await writer.write(new TextEncoder().encode('x\n')); // Add newline
				writer.releaseLock();
				console.log('Initial data request sent');
			} catch (writeError) {
				console.error('Error sending initial request:', writeError);
			}

			// Start reading data
			this.readData();
		} catch (error) {
			console.error('Error connecting to Arduino:', error);

			// Provide more specific error messages
			let errorMessage = 'Error connecting to Arduino: ';
			const errorMsg = error instanceof Error ? error.message : String(error);

			if (errorMsg.includes('Failed to open serial port')) {
				errorMessage +=
					'Port may be in use by another application (like Arduino IDE). Please close any other programs using the serial port and try again.';
			} else if (errorMsg.includes('No port selected')) {
				errorMessage += 'No port was selected.';
			} else {
				errorMessage += errorMsg;
			}

			alert(errorMessage);

			// Clean up on error
			this.updateStatus(false, 'Error');
			await this.disconnect();
		}
	}

	async disconnect(): Promise<void> {
		try {
			console.log('Disconnecting Arduino...');

			// Set flags first to stop any ongoing operations
			this.isConnected = false;
			this.updateStatus(false, 'Disconnecting...');

			// Close reader
			if (this.reader) {
				try {
					await this.reader.cancel();
				} catch (readerError) {
					console.warn('Error closing reader:', readerError);
				}
				this.reader = null;
			}

			// Close port
			if (this.port) {
				try {
					await this.port.close();
				} catch (portError) {
					console.warn('Error closing port:', portError);
				}
				this.port = null;
			}

			this.updateStatus(false, 'Disconnected');
			console.log('Arduino disconnected successfully');
		} catch (error) {
			console.error('Error disconnecting Arduino:', error);
			// Force reset even if there's an error
			this.isConnected = false;
			this.updateStatus(false, 'Error');
			this.reader = null;
			this.port = null;
		}
	}

	private async readData(): Promise<void> {
		console.log('Starting Arduino data reading loop...');
		let buffer = '';

		try {
			while (this.reader && this.isConnected) {
				const { value, done } = await this.reader.read();
				if (done) {
					console.log('Arduino reader done');
					break;
				}

				// Add new data to buffer
				buffer += value;

				// Process complete lines
				const lines = buffer.split('\n');
				// Keep the last incomplete line in buffer
				buffer = lines.pop() || '';

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (trimmedLine.length > 0) {
						console.log('Received Arduino data:', trimmedLine);
						const values = trimmedLine.split(',');
						if (values.length >= 3) {
							const newHeading = parseFloat(values[0]);
							const newRoll = parseFloat(values[1]);
							const newPitch = parseFloat(values[2]);

							// Only update if values are valid numbers
							if (!isNaN(newHeading) && !isNaN(newRoll) && !isNaN(newPitch)) {
								const data: ArduinoData = {
									heading: newHeading,
									roll: newRoll,
									pitch: newPitch
								};
								
								if (this.onDataCallback) {
									this.onDataCallback(data);
								}
								
								console.log('Updated orientation:', data);
							}
						}
					}
				}

				// Send request for next data point with error handling
				if (this.port && this.port.writable && this.isConnected) {
					try {
						const writer = this.port.writable.getWriter();
						await writer.write(new TextEncoder().encode('x\n')); // Add newline
						writer.releaseLock();
					} catch (writeError) {
						console.error('Error sending data request:', writeError);
						// Don't break the loop for write errors, just log them
					}
				}

				// Small delay to prevent overwhelming the Arduino
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
		} catch (error) {
			console.error('Error reading Arduino data:', error);
			const errorMsg = error instanceof Error ? error.message : String(error);
			const errorName = error instanceof Error ? error.name : 'Unknown';
			console.error('Error details:', errorName, errorMsg);

			// Update status but try to reconnect instead of just disabling
			this.updateStatus(false, 'Connection Lost - Attempting Reconnect');

			// Attempt to reconnect after a delay
			setTimeout(async () => {
				if (!this.isConnected) {
					console.log('Attempting to reconnect to Arduino...');
					await this.connect();
				}
			}, 2000);
		}

		console.log('Arduino data reading loop ended');
	}

	get connected(): boolean {
		return this.isConnected;
	}
}
