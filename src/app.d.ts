// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {}
    interface PageData {
      names: {
        id: number;
        name: string;
        email: string;
      }[];
    }
    interface Platform {}
  }
}

export {};