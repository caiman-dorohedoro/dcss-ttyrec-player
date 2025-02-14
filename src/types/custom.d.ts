declare module 'bz2';
declare module 'asciinema-player';
declare module '@/lib/bz2' {
  export default function decompress(data: Uint8Array): Uint8Array;
}