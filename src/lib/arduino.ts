let heading: number = 0;
let pitch: number = 0;
let roll: number = 0;

let port: SerialPort | null = null;
let reader: ReadableStreamDefaultReader<string> | null = null;
let writer: WritableStreamDefaultWriter<string> | null = null;

export async function choosePort(): Promise<void> {
  if (!("serial" in navigator)) {
    alert("Web Serial API not supported in this browser.");
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    port = await (navigator as any).serial.requestPort() as SerialPort;
    await port.open({ baudRate: 9600 });

    const textDecoder = new TextDecoderStream();
    port.readable?.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(port.writable!);
    writer = textEncoder.writable.getWriter();

    readLoop();

    await writer.write("x");
  } catch (err) {
    alert("Serial port error: " + (err instanceof Error ? err.message : String(err)));
  }
}

async function readLoop(): Promise<void> {
  if (!reader) return;

  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("Reader released");
        break;
      }
      if (value) {
        buffer += value;
        const lines = buffer.split("\r\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          parseSerialLine(line);
        }
      }
    }
  } catch (err) {
    alert("Read error: " + (err instanceof Error ? err.message : String(err)));
  }
}

function parseSerialLine(line: string): void {
  const trimmed = line.trim();
  if (!trimmed) return;

  const parts = trimmed.split(",");
  if (parts.length >= 3) {
    heading = parseFloat(parts[0]);
    roll = parseFloat(parts[1]);
    pitch = parseFloat(parts[2]);
    console.log(`Heading: ${heading}, Roll: ${roll}, Pitch: ${pitch}`);

    if (writer) {
      writer.write("x");
    }
  }
}