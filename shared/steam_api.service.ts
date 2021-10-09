import axios, { AxiosResponse } from 'axios';

const API_KEY = process.env.STEAM_API_KEY;

export class SteamApiService {
  public static TryGetInviteLink(userId: string): Promise<AxiosResponse> {
    if (API_KEY === undefined) {
      throw('The Steam API key is undefined, have you set the .env file?');
    }
    return axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&format=json&steamids=${userId}`);
  }

  public static TryGetUserId(userName: string): Promise<AxiosResponse> {
    if (API_KEY === undefined) {
      throw('The Steam API key is undefined, have you set the .env file?');
    }
    return axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${userName}`);
  }
}