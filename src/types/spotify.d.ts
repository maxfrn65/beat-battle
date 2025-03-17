export declare namespace Spotify {
    interface Player {
      connect(): Promise<boolean>;
      pause(): void;
      resume(): void;
      addListener(event: string, callback: (data: any) => void): void;
      _options: {
        id: string;
      };
    }
  
    interface PlayerInit {
      name: string;
      getOAuthToken: (callback: (token: string) => void) => void;
      volume?: number;
    }
  
    var Player: {
      new (options: PlayerInit): Player;
    };
  }
  
declare global {
    interface Window {
        Spotify: typeof Spotify;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export {};
  