const adal = require('adal-node');

export default class Authentication {
  private authenticationContext = null;

  constructor(tenantId: string, private log: any) {
    // Create ADAL context 
    const authorityHostUrl = 'https://login.windows.net';
    this.authenticationContext = new adal.AuthenticationContext(`${authorityHostUrl}/${tenantId}`);
  }

  /**
   * Get the access token for the provided resource
   * 
   * @param aadClientId 
   * @param aadClientSecret 
   * @param resource 
   */
  public getToken(aadClientId: string, aadClientSecret: string, resource: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.authenticationContext.acquireTokenWithClientCredentials(resource, aadClientId, aadClientSecret, (err, response) => {
        if (err) {
          console.log('Failed to retrieve token', err);
          reject();
        }

        this.log.info(`Access token retrieved for: "${resource}".`)
        resolve(response.accessToken as string);
      });
    });
  };
}