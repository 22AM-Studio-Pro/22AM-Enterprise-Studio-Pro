export type GpuBackend = 'cuda' | 'opencl' | 'metal' | 'cpu';

export interface GpuDevice {
  id: string;
  backend: GpuBackend;
  name: string;
  vramMb: number;
  available: boolean;
}

export interface GpuAllocation {
  deviceId: string;
  sceneId: string;
  allocatedAt: number;
}

export class GPUManager {
  private readonly devices: GpuDevice[] = [
    { id: 'gpu-0', backend: 'cuda', name: 'Primary GPU', vramMb: 8192, available: true },
    { id: 'cpu-0', backend: 'cpu', name: 'CPU Fallback', vramMb: 0, available: true },
  ];

  private readonly allocations = new Map<string, GpuAllocation>();

  registerDevice(device: GpuDevice): void {
    this.devices.push(device);
  }

  listAvailable(): GpuDevice[] {
    return this.devices.filter((d) => d.available);
  }

  allocate(sceneId: string): GpuDevice | undefined {
    const device = this.listAvailable().sort((a, b) => b.vramMb - a.vramMb)[0];
    if (!device) return undefined;

    device.available = false;
    this.allocations.set(sceneId, { deviceId: device.id, sceneId, allocatedAt: Date.now() });
    return device;
  }

  release(sceneId: string): void {
    const allocation = this.allocations.get(sceneId);
    if (!allocation) return;

    const device = this.devices.find((d) => d.id === allocation.deviceId);
    if (device) device.available = true;
    this.allocations.delete(sceneId);
  }

  getFfmpegHwAccelArgs(device: GpuDevice): string[] {
    switch (device.backend) {
      case 'cuda':
        return ['-hwaccel', 'cuda', '-hwaccel_output_format', 'cuda'];
      case 'metal':
        return ['-hwaccel', 'videotoolbox'];
      case 'opencl':
        return ['-hwaccel', 'opencl'];
      default:
        return [];
    }
  }
}
