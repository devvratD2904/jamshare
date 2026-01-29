export async function decodeAudio(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    return decodedBuffer;
}

// Simple Zero-Crossing Rate (ZCR) approximation for "pitch" visual
// Real pitch detection (e.g. YIN algorithm) is complex for frontend-only without WASM.
// This provides a "visual reference" roughly mapping to frequency intensity/changes.
export function extractPitchCurve(buffer: AudioBuffer, samplesPerSecond: number = 20): Float32Array {
    const channelData = buffer.getChannelData(0); // Mono analysis
    const sampleRate = buffer.sampleRate;
    const samplesPerChunk = Math.floor(sampleRate / samplesPerSecond);
    const totalChunks = Math.floor(channelData.length / samplesPerChunk);

    const pitchCurve = new Float32Array(totalChunks);

    for (let i = 0; i < totalChunks; i++) {
        let chunkStart = i * samplesPerChunk;
        let zeroCrossings = 0;

        // Zero-Crossing analysis for this chunk
        for (let j = 0; j < samplesPerChunk - 1; j++) {
            const v1 = channelData[chunkStart + j];
            const v2 = channelData[chunkStart + j + 1];
            if ((v1 >= 0 && v2 < 0) || (v1 < 0 && v2 >= 0)) {
                zeroCrossings++;
            }
        }

        // Visualize "Energy + Frequency" hybrid (smoother for graphs)
        // Normalize roughly between 0-1 for canvas drawing

        // Basic Frequency Estimate = (ZeroCrossings * SampleRate) / (2 * ChunkSize)
        // Check local energy to filter silence
        let energy = 0;
        for (let k = 0; k < samplesPerChunk; k += 10) { // sparse energy check
            energy += Math.abs(channelData[chunkStart + k]);
        }
        energy /= (samplesPerChunk / 10);

        if (energy < 0.01) {
            pitchCurve[i] = 0; // Silence
        } else {
            // Normalized rough frequency height (0.2 to 0.8 range ideally)
            const roughFreq = (zeroCrossings / samplesPerChunk) * 10;
            pitchCurve[i] = Math.min(1, Math.max(0.1, roughFreq));
        }
    }

    return pitchCurve;
}
