declare module 'heic2any' {
  type Heic2AnyOptions = {
    blob: Blob;
    toType?: 'image/jpeg' | 'image/png' | 'image/gif';
    quality?: number;
    multiple?: boolean;
  };
  export default function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;
}

declare module '@upng/upng-js' {
  const UPNG: {
    encode(frames: ArrayBuffer[], width: number, height: number, colors: number): ArrayBuffer;
  };
  export default UPNG;
}
